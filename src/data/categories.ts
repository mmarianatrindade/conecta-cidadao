import { Category } from './types';
/** Navy-first category accents (readable across light backgrounds). */
export const CATEGORIES: Category[] = [
  { id:'saude', name:'Saúde', icon:'medkit-outline', tint:'#156AA8', soft:'#E2F1FF', caption:'UBS, UPA, hospitais' },
  { id:'seguranca', name:'Segurança pública', icon:'shield-checkmark-outline', tint:'#3556A3', soft:'#E8ECFB', caption:'Delegacias e proteção' },
  { id:'documentos', name:'Documentos', icon:'id-card-outline', tint:'#315D93', soft:'#E5EEFC', caption:'Identidade e atendimento' },
  { id:'assistencia', name:'Assistência social', icon:'people-outline', tint:'#4878AD', soft:'#EAF3FB', caption:'CRAS e acolhimento' },
  { id:'justica', name:'Justiça e direitos', icon:'scale-outline', tint:'#525DA2', soft:'#ECEDFC', caption:'Defensoria e Procon' },
  { id:'transporte', name:'Transporte', icon:'bus-outline', tint:'#147DA6', soft:'#E0F4FB', caption:'Bilhete e mobilidade' },
  { id:'educacao', name:'Educação e cultura', icon:'library-outline', tint:'#526EA8', soft:'#EAF0FC', caption:'Bibliotecas e cursos' },
  { id:'trabalho', name:'Trabalho e benefícios', icon:'briefcase-outline', tint:'#236E97', soft:'#E5F2F9', caption:'Emprego e INSS' },
  { id:'ambiente', name:'Meio ambiente', icon:'leaf-outline', tint:'#277B91', soft:'#E7F3F9', caption:'Ecopontos e zeladoria' }
];
export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c=>[c.id,c])) as Record<Category['id'],Category>;
