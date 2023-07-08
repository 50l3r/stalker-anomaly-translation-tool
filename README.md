# Stalker Anomaly Translation Tool (SATT)

SATT es una herramienta que automatiza el proceso de traducción de los archivos de texto del juego Stalker Anomaly.

El software esta pensado para poder  traducir tanto los ficheros base como los mods que se le añadan.

## Tabla de contenido

- [Dependencias](#dependencias)
- [Directus](#directus)
- [Instalacíon](#instalacíon)
- [Uso](#uso)

## Dependencias

Para poder ejecutar correctamente el software es necesario tener instalado lo siguiente:

- NodeJS: v16 o superior
- Directus: v9 o superior. [Leer más](https://docs.directus.io/).
- API de OpenAI: v1.0.0 o superior. [Leer más](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key)

## Directus

Directus se utiliza como Baas (Backend as a Service) para poder almacenar los datos de los ficheros de texto y poder traducirlos. Para poder utilizarlo es necesario crear un proyecto y configurar la base de datos. Esto se puede hacer en cloud o self-hosted. Para más información leer la [documentación](https://docs.directus.io/).

### Colección

Solo hará falta una colección llamada "Translations" con los siguientes campos:

- **id:** integer
- **user_created:** string
- **user_updated:** string
- **date_created:** datetime
- **date_updated:** datetime
- **filename:** string (required)
- **key:** string (required)
- **value_en:** string (required)
- **value_es:** string (required)
- **status:** enum (Aprobado, Pendiente)

## Instalación
Para poder instalar todas las dependencias ejecutar el siguiente comando:

```sh
npm install
```
Una vez instaladas rellena crea tu fichero `.env` con los siguientes datos:

```sh
OPENAI_API_KEY="Api key de OpenAI"

DIRECTUS_URL="URL de la API de Directus"
DIRECTUS_STATIC_TOKEN="Token de la API de Directus"

MODS_FOLDER="Ruta de la carpeta de los mods de MO2"

SOURCE_LANGUAGE_KEY=eng
SOURCE_LANGUAGE=english

TARGET_LANGUAGE_KEY=spa
TARGET_LANGUAGE=spanish

```

## Uso

SATT dispone de varios procesos para automatizar la mayoria de lo posible las traducciones. En este proceso entenderemos que se esta realizando una traducción de ingles (eng) a español (spa):

### 1. Copiado de ficheros de traduccion de mods


```sh
npm run copy:mods
```
Copia todos los ficheros xml de traducción necesarios de la carpeta mods de ModOrganizer2 escecificada en la clave `MODS_FOLDER` del fichero `.env` a `src/data/eng/mods` para su posterior traducción.


### 2. Traducción base


```sh
npm run translate
```
Traduce los ficheros base del juego que deben de estar previamente en la carpeta `src/data/eng/base` y los almacena en la base de datos de Directus

### 3. Traducción de mods


```sh
npm run translate:mods
```
Traduce los ficheros base del juego que deben de estar en la carpeta `src/data/eng/base` y los almacena en la base de datos de Directus


### 3. Generado de ficheros


```sh
npm run build
```
Este proceso recoge todas las traducciones desde la base de datos que ya estan traducidas y genera los ficheros de traducción en la carpeta `src/data/spa`



