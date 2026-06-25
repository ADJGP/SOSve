/* data.js — Datos estáticos de referencia */

const ESTADOS_VENEZUELA = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas',
  'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro',
  'Dependencias Federales', 'Distrito Capital', 'Falcón',
  'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas',
  'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira',
  'Trujillo', 'Vargas (La Guaira)', 'Yaracuy', 'Zulia'
];

const SALUD_MAP = {
  sano:        { label: '✅ Sano',           css: 'tag-salud-sano' },
  leve:        { label: '🟡 Heridas leves',  css: 'tag-salud-leve' },
  grave:       { label: '🔴 Heridas graves', css: 'tag-salud-grave' },
  critico:     { label: '⛔ Crítico',        css: 'tag-salud-critico' },
  fallecido:   { label: '⚫ Fallecido',      css: 'tag-salud-fallecido' },
  desconocido: { label: '❓ Desconocido',    css: 'tag-salud-desconocido' }
};

const TIPO_REGISTRO_MAP = {
  encontrado:   { label: '✅ Encontrado',    css: 'tag-reg-encontrado' },
  buscado:      { label: '🔍 Buscado',       css: 'tag-reg-buscado' },
  en_refugio:   { label: '🏠 En refugio',    css: 'tag-reg-en_refugio' },
  hospitalizado:{ label: '🏥 Hospitalizado', css: 'tag-reg-hospitalizado' }
};

const TIPO_PERSONA_MAP = {
  adulto:       { label: 'Adulto',       icon: '👤', css: 'tag-tipo-adulto', avatarCss: 'adulto' },
  nino:         { label: 'Niño/Adol.',   icon: '👦', css: 'tag-tipo-nino',   avatarCss: 'nino' },
  adulto_mayor: { label: 'Adulto mayor', icon: '👴', css: 'tag-tipo-am',     avatarCss: 'adulto_mayor' }
};

/* ---------- DATOS DE EJEMPLO (modo demo) ---------- */
const MOCK_REGISTROS = [
  {
    ID: 'R_DEMO_001', Timestamp: '2026-06-25T08:30:00Z',
    Nombre: 'María Elena Rodríguez', Edad: 42, TipoPersn: 'adulto', Genero: 'femenino',
    Cedula: 'V-9876543', Telefono: '0412-5551234',
    Estado: 'Caracas', Municipio: 'Libertador', Direccion: 'Refugio Colegio San Ignacio',
    EstadoSalud: 'sano', TipoRegistro: 'encontrado', DescSalud: '',
    ReporterNombre: 'Carlos López', ReporterContacto: '0416-7778899', Notas: ''
  },
  {
    ID: 'R_DEMO_002', Timestamp: '2026-06-25T09:15:00Z',
    Nombre: 'Juan Carlos Pérez', Edad: 8, TipoPersn: 'nino', Genero: 'masculino',
    Cedula: '', Telefono: '',
    Estado: 'Vargas (La Guaira)', Municipio: 'Vargas', Direccion: 'Hospital Vargas',
    EstadoSalud: 'leve', TipoRegistro: 'hospitalizado', DescSalud: 'Fractura de brazo derecho, estable',
    ReporterNombre: 'Enf. Ana Sucre', ReporterContacto: '0424-1112233', Notas: 'Busca a sus padres'
  },
  {
    ID: 'R_DEMO_003', Timestamp: '2026-06-25T10:05:00Z',
    Nombre: 'Rosa Mendoza', Edad: 67, TipoPersn: 'adulto_mayor', Genero: 'femenino',
    Cedula: 'V-4321098', Telefono: '0212-5550001',
    Estado: 'Miranda', Municipio: 'Sucre', Direccion: 'Albergue Petare Norte',
    EstadoSalud: 'sano', TipoRegistro: 'en_refugio', DescSalud: '',
    ReporterNombre: 'Defensa Civil Miranda', ReporterContacto: '@DefensaCivilMiranda', Notas: ''
  },
  {
    ID: 'R_DEMO_004', Timestamp: '2026-06-25T10:45:00Z',
    Nombre: 'Pedro José Gómez', Edad: 35, TipoPersn: 'adulto', Genero: 'masculino',
    Cedula: 'V-14500321', Telefono: '',
    Estado: 'Aragua', Municipio: 'Maracay', Direccion: 'Barrio El Limón, calle 3',
    EstadoSalud: 'grave', TipoRegistro: 'hospitalizado', DescSalud: 'Trauma craneal, en UCI Hospital Central',
    ReporterNombre: 'Familie Gómez', ReporterContacto: '0412-9998877', Notas: ''
  },
  {
    ID: 'R_DEMO_005', Timestamp: '2026-06-25T11:20:00Z',
    Nombre: 'Valentina Torres', Edad: 14, TipoPersn: 'nino', Genero: 'femenino',
    Cedula: '', Telefono: '',
    Estado: 'Carabobo', Municipio: 'Valencia', Direccion: 'Refugio Ciudad Alianza',
    EstadoSalud: 'sano', TipoRegistro: 'en_refugio', DescSalud: '',
    ReporterNombre: 'Alcaldía Valencia', ReporterContacto: '@AlcaldiaValencia', Notas: 'Separada de familia'
  },
  {
    ID: 'R_DEMO_006', Timestamp: '2026-06-25T12:00:00Z',
    Nombre: 'Luis Eduardo Ramírez', Edad: 55, TipoPersn: 'adulto', Genero: 'masculino',
    Cedula: 'V-7654321', Telefono: '0414-3334455',
    Estado: 'Lara', Municipio: 'Barquisimeto', Direccion: 'Urb. El Cuji',
    EstadoSalud: 'sano', TipoRegistro: 'encontrado', DescSalud: '',
    ReporterNombre: 'Self-report', ReporterContacto: '0414-3334455', Notas: ''
  }
];

const MOCK_ANUNCIOS = [
  {
    ID: 'A_DEMO_001', Timestamp: '2026-06-25T09:00:00Z',
    NombreBuscado: 'Carmen Luisa Blanco', Edad: 78,
    Estado: 'Vargas (La Guaira)', Ubicacion: 'Sector La Guaira, Edificio Las Flores',
    Descripcion: 'Abuela de cabello blanco, tez morena clara, contextura delgada. Usa anteojos y bastón. Llevaba bata azul el día del sismo. Última vez vista frente a su edificio que colapsó.',
    Contacto: '0412-7776655 / @JoseBlanco_Ve',
    NombreReporter: 'José Blanco (nieto)'
  },
  {
    ID: 'A_DEMO_002', Timestamp: '2026-06-25T10:30:00Z',
    NombreBuscado: 'Los niños Martínez (Sofía 5 años, Tomás 8 años)', Edad: null,
    Estado: 'Caracas', Ubicacion: 'La Vega, Barrio El Paraíso',
    Descripcion: 'Sofía: cabello oscuro rizado, ojos marrones, llevaba vestido rosado. Tomás: cabello corto negro, llevaba camisa azul de escuela. Posiblemente evacuados hacia refugio cercano. Padres ilesos buscando.',
    Contacto: '0426-1234321 o @BuscaMartinezVzla',
    NombreReporter: 'Ana Martínez (madre)'
  }
];
