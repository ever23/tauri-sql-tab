# tauri-sql-tab AI Skill (Gestor de Base de Datos para Tauri)

Esta skill define las instrucciones y patrones de uso recomendados para la librería **tauri-sql-tab**. Utiliza estos principios para gestionar la persistencia de datos en aplicaciones de escritorio Tauri de manera eficiente, segura y consistente.

## 1. Configuración del Entorno (Tauri Side)

Antes de usar la librería en JavaScript, el agente de IA debe asegurarse de que el backend de Tauri esté configurado:

### Rust (`Cargo.toml` y `lib.rs/main.rs`)
```toml
# Cargo.toml
tauri-plugin-sql = "2.0.0" 
```
```rust
// lib.rs o main.rs
.plugin(tauri_plugin_sql::Builder::default().build())
```

### Permisos (Tauri v2)
Es indispensable configurar las `capabilities` en `src-tauri/capabilities/default.json`:
`"permissions": ["sql:default", "sql:allow-load", "sql:allow-execute", "sql:allow-select"]`

## 2. Inicialización en el Frontend

```javascript
import Database from '@tauri-apps/plugin-sql';
import { tauriSqlTab } from 'tauri-sql-tab';

// 1. Cargar la DB nativa (Async)
const dbTauri = await Database.load('sqlite:app.db');

// 2. Envolver con dbtabla
const db = new tauriSqlTab(dbTauri);

// 3. Registro de modelos (Manual recomendado para Vite/Tauri)
import usuarioModelo from './model/usuarios.js';
db.addModel(usuarioModelo);

// 4. Obtención de tabla
const usuarios = db.tabla('usuarios');
```

## 3. Operaciones CRUD y Consultas

### Inserción
```javascript
await usuarios.insert({ user: 'admin', tipo: 'root' });
```

### Consultas Select (Lógica Polimórfica)
| Si el 1er parámetro es... | Se interpreta como... | Ejemplo |
| :--- | :--- | :--- |
| **String** | Cláusula `WHERE` | `tabla.select("id > 10")` |
| **Array** | Lista de `CAMPOS` | `tabla.select(["user", "tipo"])` |
| **Object** | Definición de `JOINS` | `tabla.select({ "=perfil": "u.id = p.id_user" })` |

### Búsqueda Inteligente (LIKE)
```javascript
const resultados = await usuarios.busqueda("Juan", ["nombre", "user"]);
```

## 4. Patrón Active Record (dbRow)
Los resultados son instancias de **Active Record**.
```javascript
const user = await usuarios.selectOne("user = 'admin'");
if (user) {
    user.puntos += 10;
    await user.update(); // Sincronización automática
}
```

## 5. Relaciones (Joins)
Utiliza los prefijos de operador:
- `=` : **INNER JOIN**
- `<` : **LEFT JOIN**
- `>` : **RIGHT JOIN** (Simulado según el motor)

```javascript
const datos = await usuarios.select(
  ["usuarios.user", "perfiles.bio"],
  { "<perfiles": "perfiles.id_user = usuarios.id" }, 
  "usuarios.id = 1"
);
```

## 6. Sintaxis Avanzada de Filtrado (Where Object)
- **Sufijos:** `campo%` (LIKE), `campo!` (!=), `campo>` (>), `campo<` (<), `campo>=` (>=), `campo<=` (<=).
- **Prefijos:** `||campo` (OR), `&&campo` (AND).

## 7. Directrices Críticas para la IA (AI-Guidelines)

> [!IMPORTANT]
> 1. **No usar `pathModels` en el frontend**: Vite/Tauri no tienen acceso a `fs`. Importa y usa `db.addModel()` manualmente.
> 2. **Preferencia de `selectOne`**: Usa `selectOne()` para búsquedas de registro único para evitar manejo de arrays.
> 3. **Peligro de Polimorfismo**: Si el primer argumento de `select()` es un objeto, se asume que son JOINS. Para filtrar por objeto de forma segura: `tabla.select(null, null, { activo: 1 })` o usa la sintaxis de **Objeto Único**: `tabla.select({ where: { activo: 1 } })`.
> 4. **Cadenas Numéricas**: IDs con ceros a la izquierda (ej: `"01"`) deben tratarse siempre como strings para no perder el formato.

## 8. Firma de Métodos Principales
- `selectOne(where, select, join, order)`
- `select(campos, joins, where, group, having, order, limit)`
- `insert(datos)`
- `beginTransaction()`, `commit()`, `rollback()`
- `query(sql, params)`: Puente directo a Tauri.
