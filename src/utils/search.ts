import { Unit } from '../data/types';
const simplify = (value:string) => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function searchCatalog(units: Unit[], query: string): Unit[] {
  const parts = simplify(query).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return units;
  return units.map(unit => {
    const name = simplify(unit.name+' '+unit.kind);
    const services = simplify(unit.services.join(' '));
    const others = simplify((unit.address||'')+' '+unit.summary+' '+unit.keywords.join(' ')+' '+unit.region+' '+unit.category);
    const score = parts.reduce((total,part)=>total+(name.includes(part)?4:0)+(services.includes(part)?3:0)+(others.includes(part)?1:0),0);
    return {unit,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.unit);
}
export function formatDate(raw: string): string {
  if (!raw) return 'Data não informada';
  const [y,m,d] = raw.split('-');
  return y&&m&&d ? `${d}/${m}/${y}` : raw;
}
