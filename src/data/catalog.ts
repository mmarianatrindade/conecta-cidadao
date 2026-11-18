import { Unit } from './types';

/** Catálogo curado para DEMONSTRAÇÃO ACADÊMICA. Uma fonte e data acompanham cada ficha.
 *  Não interpretar especialidades cadastradas como disponibilidade nem horários como abertos agora.
 */
export const CATALOG: Unit[] = [
  {
    id:'ubs-se',category:'saude',name:'UBS Sé',kind:'Unidade Básica de Saúde',type:'presencial',
    address:'Rua Frederico Alvarenga, 259, Sé, São Paulo - SP',region:'Sé · Centro',
    summary:'Atenção primária do SUS. Confira sua unidade de referência territorial antes de se deslocar.',
    services:['Atenção primária','Informações sobre vacinação','Encaminhamentos pela rede SUS'],
    keywords:['posto de saude','consulta','clinica','vacina','ubs','sus','exames'],
    access:'A UBS de referência pode depender do endereço de residência. Especialidades e atendimentos devem ser confirmados com a unidade.',
    before:['Conferir se esta é sua UBS de referência','Confirmar documentos e o serviço desejado','Verificar orientações atuais no portal oficial'],
    source:'https://coleta.prefeitura.sp.gov.br/documents/d/saude/edital-consulta-para-cg-emergencial-centro-pdf',sourceLabel:'Secretaria Municipal de Saúde',checkedAt:'2026-11-17',
    caution:'Unidade cadastrada não significa consulta disponível.'
  },
  {
    id:'ubs-humaita',category:'saude',name:'UBS Humaitá — Dr. João de Azevedo Lage',kind:'Unidade Básica de Saúde',type:'presencial',
    address:'Rua Humaitá, 520, Bela Vista, São Paulo - SP',region:'Bela Vista · Centro',
    summary:'Unidade de atenção primária da região central. Serviços específicos exigem confirmação.',
    services:['Atenção primária','Orientação e cuidado longitudinal','Encaminhamento quando aplicável'],
    keywords:['ubs','posto','consulta','vacina','sus','humaita','enfermagem'],
    access:'Para cuidado de rotina, confirme o território de referência e os requisitos da unidade.',
    before:['Conferir sua UBS de referência','Confirmar quais serviços são prestados e os horários'],
    source:'https://coleta.prefeitura.sp.gov.br/documents/d/saude/edital-consulta-para-cg-emergencial-centro-pdf',sourceLabel:'Secretaria Municipal de Saúde',checkedAt:'2026-11-17',
    caution:'A fonte comprova localização; não informa vagas em tempo real.'
  },
  {
    id:'upa-vergueiro',category:'saude',name:'UPA Vergueiro',kind:'Unidade de Pronto Atendimento',type:'presencial',
    address:'Rua Vergueiro, 613, Liberdade, São Paulo - SP',region:'Liberdade · Centro',
    summary:'Unidade de pronto atendimento da rede pública; também listada para urgências odontológicas.',
    services:['Pronto atendimento','Urgência odontológica (conforme publicação oficial)'],
    keywords:['upa','urgencia','emergencia','dor','odontologia','pronto atendimento','hospital'],
    access:'Atendimento de urgência segue critérios clínicos e classificação de risco. Não há garantia de tempo de espera.',
    before:['Em risco imediato, ligue 192 ou 193 conforme a emergência','Confirme informações no canal oficial quando possível'],
    hours:'24 horas (informação publicada para urgência odontológica)',
    source:'https://prefeitura.sp.gov.br/web/saude/w/veja-como-buscar-atendimento-para-urg%C3%AAncias-odontol%C3%B3gicas-10',sourceLabel:'Prefeitura de São Paulo',checkedAt:'2026-11-17',
    caution:'O app não diagnostica, não faz triagem e não indica tempo real de espera.'
  },
  {
    id:'hmi-menino-jesus',category:'saude',name:'Hospital Municipal Infantil Menino Jesus',kind:'Hospital público infantil',type:'presencial',
    address:'Rua dos Franceses, 251, Bela Vista, São Paulo - SP',region:'Bela Vista · Centro',
    summary:'Hospital da rede municipal com atendimento pediátrico e ambulatórios especializados.',
    services:['Atendimento pediátrico','Ambulatórios especializados (acesso regulado)'],
    keywords:['hospital','crianca','pediatria','pediatra','especialidade','ambulatório'],
    access:'O ambulatório especializado pode exigir encaminhamento e agendamento pela rede SUS. Não compareça sem confirmar as regras.',
    before:['Confirmar se o atendimento é ambulatorial ou de urgência','Consultar encaminhamento e requisitos oficiais'],
    source:'https://prefeitura.sp.gov.br/web/hospital_municipal_infantil_menino_jesus/atendimento',sourceLabel:'Hospital / Prefeitura de São Paulo',checkedAt:'2026-11-17',
    caution:'Especialidades existentes não implicam consultas disponíveis diretamente.'
  },
  {
    id:'casa-mulher',category:'seguranca',name:'Casa da Mulher Brasileira',kind:'Equipamento integrado de proteção',type:'presencial',
    address:'Rua Vieira Ravasco, 26, Cambuci, São Paulo - SP',region:'Cambuci · Centro',
    summary:'Atendimento integrado voltado a mulheres em situação de violência, incluindo serviços de proteção e acolhimento.',
    services:['Acolhimento e orientação','Rede de proteção','Atendimentos especializados conforme órgão'],
    keywords:['mulher','violencia','proteção','delegacia da mulher','ddm','apoio','segurança'],
    access:'O equipamento informa atendimento geral 24h, mas os serviços internos podem ter horários próprios. Em perigo imediato, ligue 190.',
    before:['Em risco imediato, acione o 190','Consulte o canal oficial para detalhes de cada serviço'],
    hours:'Acolhimento geral 24 horas (serviços internos podem variar)',
    source:'https://prefeitura.sp.gov.br/direitos_humanos/w/mulheres/equipamentos/288423',sourceLabel:'Prefeitura de São Paulo',checkedAt:'2026-11-17',
    caution:'Não publicar relatos identificáveis de vítimas ou denúncias no app.'
  },
  {
    id:'delegacia-eletronica',category:'seguranca',name:'Delegacia Eletrônica SP',kind:'Serviço digital da Polícia Civil',type:'digital',region:'São Paulo · Online',
    summary:'Registro digital de determinados tipos de ocorrência, sujeito às regras oficiais.',
    services:['Registro de ocorrência online (quando elegível)','Orientação sobre tipos de ocorrência'],
    keywords:['bo','boletim','ocorrencia','roubo','furto','perda','documentos','policia','delegacia'],
    access:'Consulte no portal os tipos aceitos. Emergências e casos não elegíveis exigem atendimento pelos canais adequados.',
    before:['Verificar se sua ocorrência pode ser registrada online','Não enviar dados de ocorrência para o Conecta Cidadão'],
    source:'https://www.ssp.sp.gov.br/servicos/delegacia-eletronica',sourceLabel:'Secretaria da Segurança Pública SP',checkedAt:'2026-11-17'
  },
  {
    id:'poupatempo-se',category:'documentos',name:'Poupatempo Sé',kind:'Posto de serviços estaduais',type:'presencial',
    address:'Rua do Carmo, s/n, Sé, São Paulo - SP',region:'Sé · Centro',
    summary:'Posto do Poupatempo para serviços estaduais; procedimentos e postos habilitados variam.',
    services:['Documentação (conforme carta do serviço)','Agendamentos oficiais','Serviços estaduais'],
    keywords:['rg','cin','identidade','cnh','poupatempo','documentos','agendar','certidao'],
    access:'Muitos atendimentos exigem agendamento. Consulte a carta do serviço e confirme o posto antes de ir.',
    before:['Selecionar o serviço exato no portal Poupatempo','Conferir agendamento e documentos exigidos','Confirmar endereço do posto escolhido'],
    source:'https://poupatempo.sp.gov.br/carta/69911DA9-BF0E-4485-8845-041252811CEB',sourceLabel:'Poupatempo SP',checkedAt:'2026-11-17',
    caution:'A unidade listada não garante oferta de qualquer serviço sem agendamento.'
  },
  {
    id:'descomplica-se',category:'documentos',name:'Descomplica SP Sé',kind:'Central municipal de atendimento',type:'presencial',
    address:'Rua Álvares Penteado, 49, Centro Histórico, São Paulo - SP',region:'Sé · Centro',
    summary:'Atendimento presencial para diferentes serviços municipais, conforme lista de cada posto.',
    services:['Informações de serviços municipais','Orientação presencial','Atendimentos municipais disponíveis por unidade'],
    keywords:['prefeitura','municipal','descomplica','atendimento','documentos','agendar'],
    access:'Consulte previamente se o serviço específico está disponível neste posto.',
    before:['Consultar a relação de serviços disponíveis','Verificar exigências e possíveis agendamentos'],
    source:'https://prefeitura.sp.gov.br/web/inovacao/w/descomplica-sp',sourceLabel:'Prefeitura de São Paulo',checkedAt:'2026-11-17'
  },
  {
    id:'govbr',category:'documentos',name:'Portal GOV.BR',kind:'Serviços públicos digitais',type:'digital',region:'Brasil · Online',
    summary:'Portal federal de acesso e orientação sobre serviços digitais e documentos.',
    services:['Catálogo federal de serviços','Documentos e certidões (conforme serviço)','Acesso aos órgãos federais'],
    keywords:['cpf','documentos','digital','governo','govbr','certidao','cadastro'],
    access:'Cada serviço tem requisitos próprios. O Conecta Cidadão nunca solicita sua senha GOV.BR.',
    before:['Acessar apenas a página oficial','Ler os requisitos e conferir se há atendimento digital'],
    source:'https://www.gov.br/pt-br',sourceLabel:'Governo Federal',checkedAt:'2026-11-17'
  },
  {
    id:'cras-se',category:'assistencia',name:'CRAS Sé',kind:'Centro de Referência de Assistência Social',type:'presencial',
    address:'Avenida Tiradentes, 749, Bom Retiro, São Paulo - SP',region:'Bom Retiro · Centro',
    summary:'Referência para acesso à proteção social básica, orientações e acompanhamento social.',
    services:['Orientação socioassistencial','Proteção social básica','Encaminhamentos e serviços de referência'],
    keywords:['cras','assistencia','bolsa familia','cadunico','familia','beneficios','ajuda'],
    access:'A unidade de referência pode depender do território e da situação familiar. Confirme os serviços e documentos.',
    before:['Consultar a abrangência territorial','Confirmar formas de atendimento e documentação'],
    source:'https://prefeitura.sp.gov.br/web/assistencia_social/w/protecao_social_basica/330925',sourceLabel:'Prefeitura de São Paulo',checkedAt:'2026-11-17'
  },
  {
    id:'defensoria',category:'justica',name:'Defensoria Pública de São Paulo',kind:'Orientação e agendamento oficial',type:'digital',region:'Estado de São Paulo · Online',
    summary:'Orientações de assistência jurídica e consulta a locais de atendimento.',
    services:['Assistência jurídica conforme critérios','Orientação sobre agendamento','Unidades de atendimento'],
    keywords:['advogado','justica','direitos','juridico','defensoria','processo'],
    access:'Atendimento geralmente requer agendamento e análise dos critérios. Consulte o canal oficial.',
    before:['Verificar critérios de atendimento','Conferir agendamento e documentos'],
    source:'https://www.defensoria.sp.def.br/',sourceLabel:'Defensoria Pública SP',checkedAt:'2026-11-17'
  },
  {
    id:'procon-sp',category:'justica',name:'Procon-SP',kind:'Proteção do consumidor',type:'digital',region:'Estado de São Paulo · Online',
    summary:'Orientações e canais oficiais de defesa do consumidor.',
    services:['Informações sobre direitos do consumidor','Canais de reclamação','Orientação sobre atendimento'],
    keywords:['consumidor','compra','procon','reclamacao','empresa','direitos'],
    access:'Reclamações devem ser encaminhadas ao canal oficial do Procon, não ao formulário de feedback do app.',
    before:['Reunir informações da compra ou serviço','Consultar opções e requisitos no site oficial'],
    source:'https://www.procon.sp.gov.br/',sourceLabel:'Procon-SP',checkedAt:'2026-11-17'
  },
  {
    id:'sptrans',category:'transporte',name:'SPTrans — Postos de atendimento',kind:'Localizador oficial',type:'digital',region:'São Paulo · Online',
    summary:'Consulta oficial de postos de Bilhete Único e serviços de transporte municipal.',
    services:['Localizador de postos','Informações sobre Bilhete Único','Atendimento de transporte'],
    keywords:['onibus','bilhete unico','sptrans','cartao','passagem','transporte'],
    access:'Horários e serviços diferem por posto. Consulte o localizador antes de se deslocar.',
    before:['Selecionar o tipo de serviço necessário','Conferir unidade e horário no portal SPTrans'],
    source:'https://www.sptrans.com.br/',sourceLabel:'SPTrans',checkedAt:'2026-11-17'
  },
  {
    id:'biblioteca-mario',category:'educacao',name:'Biblioteca Mário de Andrade',kind:'Biblioteca pública',type:'presencial',
    address:'Rua da Consolação, 94, República, São Paulo - SP',region:'República · Centro',
    summary:'Biblioteca pública municipal com áreas de leitura e acervo para consulta.',
    services:['Leitura e pesquisa','Acervos e serviços de biblioteca','Programação cultural (consultar)'],
    keywords:['livro','biblioteca','leitura','estudar','cultura','educacao','pesquisa'],
    access:'Confirme dias, horários e regras de acesso às seções desejadas no site oficial.',
    before:['Consultar horários e serviços por ambiente','Conferir regras para empréstimo e consulta'],
    source:'https://prefeitura.sp.gov.br/web/cultura/w/bma/menu/servico/9709',sourceLabel:'Prefeitura de São Paulo',checkedAt:'2026-11-17'
  },
  {
    id:'cate',category:'trabalho',name:'Cate — Centro de Apoio ao Trabalho',kind:'Localizador e serviços oficiais',type:'digital',region:'São Paulo · Online',
    summary:'Rede municipal de atendimento para empregabilidade, orientação e capacitação.',
    services:['Busca por atendimento ao trabalhador','Orientação profissional','Informações sobre unidades'],
    keywords:['emprego','cate','curriculo','vagas','trabalho','entrevista','curso'],
    access:'Confirme o posto e o atendimento pretendido no portal municipal antes de visitar.',
    before:['Consultar serviços e unidades atuais','Separar os documentos indicados no portal'],
    source:'https://prefeitura.sp.gov.br/web/desenvolvimento',sourceLabel:'Prefeitura de São Paulo',checkedAt:'2026-11-17'
  },
  {
    id:'meu-inss',category:'trabalho',name:'Meu INSS',kind:'Serviço digital federal',type:'digital',region:'Brasil · Online',
    summary:'Canal oficial para serviços previdenciários e agendamentos aplicáveis.',
    services:['Benefícios previdenciários','Consultas e solicitações','Agendamentos oficiais'],
    keywords:['aposentadoria','beneficio','inss','previdencia','pericia','pensão'],
    access:'Os critérios e a documentação dependem do serviço. O app não avalia elegibilidade.',
    before:['Conferir requisitos no portal oficial','Não compartilhar senha com terceiros'],
    source:'https://meu.inss.gov.br/',sourceLabel:'INSS / Governo Federal',checkedAt:'2026-11-17'
  },
  {
    id:'ecoponto-liberdade',category:'ambiente',name:'Ecoponto Liberdade',kind:'Ponto de descarte municipal',type:'presencial',
    address:'Rua Jaceguai, 67, Liberdade, São Paulo - SP',region:'Liberdade · Centro',
    summary:'Ponto municipal de recebimento de materiais permitidos pelo programa de Ecopontos.',
    services:['Descarte de materiais permitidos','Orientações sobre descarte municipal'],
    keywords:['ecoponto','entulho','moveis','descarte','reciclagem','lixo'],
    access:'Tipos e quantidades aceitos podem ter restrições; confira a regra vigente antes de transportar materiais.',
    before:['Verificar os materiais e limites aceitos','Conferir funcionamento atual'],
    source:'https://prefeitura.sp.gov.br/web/se/w/ecopontos/subse',sourceLabel:'Prefeitura de São Paulo',checkedAt:'2026-11-17'
  },
  {
    id:'sp156',category:'ambiente',name:'SP156 — Serviços municipais',kind:'Canal digital da Prefeitura',type:'digital',region:'São Paulo · Online',
    summary:'Portal municipal de solicitações, informações e acompanhamento de serviços urbanos.',
    services:['Solicitação de serviços urbanos','Orientações de zeladoria','Acompanhamento oficial de protocolos'],
    keywords:['lixo','buraco','arvore','iluminacao','rua','zeladoria','prefeitura','156'],
    access:'Solicitações e acompanhamento devem ser feitos no portal oficial.',
    before:['Identificar o tipo de solicitação','Consultar documentos e informações necessários'],
    source:'https://sp156.prefeitura.sp.gov.br/',sourceLabel:'Prefeitura de São Paulo',checkedAt:'2026-11-17'
  }
];

export const POPULAR_QUERIES = [
  {label:'Preciso de uma UBS', query:'ubs'},
  {label:'Perdi meus documentos', query:'perda documentos'},
  {label:'Tirar identidade', query:'identidade'},
  {label:'Descarte de móveis', query:'ecoponto'},
];

export const EMERGENCY = [
 {number:'190',name:'Polícia Militar',icon:'shield-outline'},
 {number:'192',name:'SAMU',icon:'medkit-outline'},
 {number:'193',name:'Bombeiros',icon:'flame-outline'},
 {number:'199',name:'Defesa Civil',icon:'warning-outline'}
];
