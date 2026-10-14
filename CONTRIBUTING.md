# Cómo contribuir

## Autoría de los commits

Todos los commits de este proyecto se hacen a nombre de **Kratos**:

- Nombre: `Kratos`
- Usuario de GitHub: `KratosNub777`
- Correo: `facundovera0702@gmail.com` (es el que une cada commit con la cuenta de GitHub)

Para configurarlo en tu copia del repositorio:

```bash
git config user.name "Kratos"
git config user.email "facundovera0702@gmail.com"
```

## Commits pequeños

- Muchos commits pequeños mejor que pocos grandes: cada valor, regla CSS o componente que cambia puede ser su propio commit.
- Un commit por cambio: no mezcles una corrección, una funcionalidad y un ajuste de estilo en el mismo.
- Que cada commit deje el proyecto funcionando (`npm run typecheck` y `npm run lint` sin errores).
- Mensajes en español, con el formato `tipo(zona): resumen`, por ejemplo:
  - `fix(hero): evita que el contenido choque con el header`
  - `feat(inicio): ranking de premiados`
  - `docs: guía de contribución`

Comprueba la autoría antes de subir:

```bash
git log --format='%h %an <%ae> %s' -10
```

Tipos usados: `feat`, `fix`, `refactor`, `style`, `docs`.

## Pull requests

Una rama por tema y un pull request hacia `main` con una descripción breve de qué cambia y por qué.
