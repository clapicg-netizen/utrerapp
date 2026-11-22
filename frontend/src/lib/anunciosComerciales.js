import gozePortada from '../assets/anuncios/goze.webp';
import gozeCarne from '../assets/anuncios/goze_carne.webp';
import gozeConchas from '../assets/anuncios/goze_conchas.webp';
import gozeBocados from '../assets/anuncios/goze_bocados.webp';
import gozeNachos from '../assets/anuncios/goze_nachos.webp';
import guerreroPortada from '../assets/anuncios/guerrero.webp';
import audi from '../assets/anuncios/audi.webp';
import bmw from '../assets/anuncios/bmw.webp';
import x1 from '../assets/anuncios/x1.webp';
import citroen from '../assets/anuncios/citroen.webp';
import dacia from '../assets/anuncios/dacia.webp';
import hyundai from '../assets/anuncios/hyundai.webp';

const catalogo = 'https://automovilesguerrero.com/';
const vehiculos = [
  ['Audi Q3 Advanced 35 TFSI 150 CV S tronic', audi, 'audi-q3-advanced-35-tfsi-150cv-s-tronic'],
  ['BMW 520dA', bmw, 'bmw-520da-driving-assistant-clima-4z'],
  ['BMW X1 16d sDrive 115 CV', x1, 'bmw-x1-16d-sdrive-115cv'],
  ['Citroën C3 BlueHDi 100 CV Feel', citroen, 'citroen-c3-bluehdi-100cv-ss-feel'],
  ['Dacia Duster Essent dCi 115 CV 4x2', dacia, 'dacia-duster-essent-dci-115cv-4x2'],
  ['Hyundai Santa Fe 2.0 CRDi 4x2 Essence', hyundai, 'hyundai-santa-fe-2-0-crdi-4x2-essence-7-plazas'],
].map(([nombre, imagen, slug]) => ({ nombre, imagen, enlace: catalogo + 'listado/' + slug + '/' }));

export const anunciosComercialesActivos = process.env.REACT_APP_ANUNCIOS_COMERCIALES === 'true';

export const anunciosComerciales = [
  {
    id: 'goze-garito-gourmet',
    nombre: 'Goze Garito Gourmet',
    categoria: 'Hostelería',
    subcategoria: 'Restaurante',
    descripcion: 'Goze Garito Gourmet propone cocina mediterránea y española en Utrera. Un sitio para quedar a comer y descubrir sus platos para compartir.',
    direccion: 'San Juan Bosco, 26, 41710 Utrera, Sevilla',
    telefono: '+34660040891',
    instagram_url: 'https://www.instagram.com/gozegaritogourmet/',
    portada_url: gozePortada,
    portadaAlt: 'Plato servido en Goze Garito Gourmet',
    galeria_urls: [gozeCarne, gozeConchas, gozeBocados, gozeNachos],
    escaparate: true,
  },
  {
    id: 'automoviles-guerrero',
    nombre: 'Automóviles Guerrero',
    categoria: 'Motor',
    subcategoria: 'Vehículos de ocasión',
    descripcion: 'Desde 1994 en el sector del automóvil, Automóviles Guerrero comercializa vehículos de ocasión, kilómetro cero y alta gama de distintas marcas en Utrera.',
    direccion: 'Polígono Industrial La Aurora, Calle Comercio, 28, 41710 Utrera, Sevilla',
    telefono: '+34955861545',
    portada_url: guerreroPortada,
    portadaAlt: 'Equipo de Automóviles Guerrero entre dos coches en su exposición de Utrera',
    catalogo,
    vehiculos,
    escaparate: true,
  },
];
