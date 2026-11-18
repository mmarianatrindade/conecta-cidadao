import * as SQLite from 'expo-sqlite';
import { Feedback, Journey, Problem, Task } from '../data/types';

let connection: Promise<SQLite.SQLiteDatabase> | undefined;
const getDatabase = async () => {
  if (!connection) {
    connection = SQLite.openDatabaseAsync('conecta_cidadao.db').then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS schema_metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
        INSERT OR IGNORE INTO schema_metadata(key, value) VALUES ('schema_version', '1');
        CREATE TABLE IF NOT EXISTS favorites (
          unit_id TEXT PRIMARY KEY,
          saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS journeys (
          id TEXT PRIMARY KEY,
          unit_id TEXT NOT NULL,
          title TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          planned_date TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'planejado',
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          journey_id TEXT NOT NULL,
          text TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS feedbacks (
          id TEXT PRIMARY KEY,
          unit_id TEXT NOT NULL,
          date TEXT NOT NULL,
          waiting TEXT NOT NULL,
          resolved TEXT NOT NULL,
          access TEXT NOT NULL,
          clarity TEXT NOT NULL,
          comment TEXT NOT NULL DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS corrections (
          id TEXT PRIMARY KEY,
          unit_id TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_tasks_journey ON tasks(journey_id);
      `);
      const migration = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      const version = migration?.user_version ?? 0;
      if (version < 1) {
        await db.execAsync(`
          CREATE INDEX IF NOT EXISTS idx_journeys_status ON journeys(status);
          CREATE INDEX IF NOT EXISTS idx_feedbacks_unit ON feedbacks(unit_id);
          CREATE INDEX IF NOT EXISTS idx_corrections_unit ON corrections(unit_id);
          PRAGMA user_version = 1;
        `);
      }
      await db.runAsync(
        "INSERT OR REPLACE INTO schema_metadata(key, value) VALUES ('schema_version', '1')",
      );
      return db;
    }).catch(err => { connection = undefined; throw err; });
  }
  return connection;
};

export const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
export type LocalState = { favorites: string[]; journeys: Journey[]; tasks: Task[]; feedbacks: Feedback[]; problems: Problem[] };
export async function loadLocalState(): Promise<LocalState> {
  const db = await getDatabase();
  const [fs, js, ts, fb, ps] = await Promise.all([
    db.getAllAsync<{unit_id:string}>('SELECT unit_id FROM favorites ORDER BY saved_at DESC'),
    db.getAllAsync<{id:string,unit_id:string,title:string,note:string,planned_date:string,status:string,created_at:string}>('SELECT * FROM journeys ORDER BY created_at DESC'),
    db.getAllAsync<{id:string,journey_id:string,text:string,done:number}>('SELECT * FROM tasks'),
    db.getAllAsync<Feedback>('SELECT * FROM feedbacks ORDER BY date DESC'),
    db.getAllAsync<{id:string,unit_id:string,description:string,created_at:string}>('SELECT * FROM corrections ORDER BY created_at DESC')
  ]);
  return {
    favorites: fs.map(r => r.unit_id),
    journeys: js.map(r => ({id:r.id,unitId:r.unit_id,title:r.title,note:r.note,plannedDate:r.planned_date,status:r.status==='concluido'?'concluido':'planejado',createdAt:r.created_at})),
    tasks: ts.map(r => ({id:r.id,journeyId:r.journey_id,text:r.text,done:!!r.done})),
    feedbacks: fb,
    problems: ps.map(r => ({id:r.id,unitId:r.unit_id,description:r.description,createdAt:r.created_at}))
  };
}
export async function writeFavorite(id: string, shouldSave: boolean): Promise<void> {
  const db = await getDatabase();
  if (shouldSave) await db.runAsync('INSERT OR REPLACE INTO favorites (unit_id) VALUES (?)', id);
  else await db.runAsync('DELETE FROM favorites WHERE unit_id = ?', id);
}
export async function insertJourney(j: Journey, items: Task[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('INSERT INTO journeys (id,unit_id,title,note,planned_date,status,created_at) VALUES (?,?,?,?,?,?,?)',j.id,j.unitId,j.title,j.note,j.plannedDate,j.status,j.createdAt);
    for (const task of items) await db.runAsync('INSERT INTO tasks (id,journey_id,text,done) VALUES (?,?,?,?)',task.id,task.journeyId,task.text,task.done?1:0);
  });
}
export async function updateTask(id: string, done: boolean): Promise<void> {
  await (await getDatabase()).runAsync('UPDATE tasks SET done = ? WHERE id = ?',done?1:0,id);
}
export async function updateJourneyStatus(id: string, status: Journey['status']): Promise<void> {
  await (await getDatabase()).runAsync('UPDATE journeys SET status = ? WHERE id = ?',status,id);
}
export async function removeJourney(id: string): Promise<void> {
  await (await getDatabase()).runAsync('DELETE FROM journeys WHERE id = ?',id);
}
export async function insertFeedback(f: Feedback): Promise<void> {
  await (await getDatabase()).runAsync('INSERT INTO feedbacks (id,unit_id,date,waiting,resolved,access,clarity,comment) VALUES (?,?,?,?,?,?,?,?)',f.id,f.unitId,f.date,f.waiting,f.resolved,f.access,f.clarity,f.comment);
}
export async function insertCorrection(p: Problem): Promise<void> {
  await (await getDatabase()).runAsync('INSERT INTO corrections (id,unit_id,description,created_at) VALUES (?,?,?,?)',p.id,p.unitId,p.description,p.createdAt);
}
export async function clearLocalData(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const name of ['tasks','journeys','favorites','feedbacks','corrections']) await db.execAsync(`DELETE FROM ${name};`);
  });
}
