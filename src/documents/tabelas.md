# Schema Completo do Banco de Dados - AgendaZap

## Estrutura detalhada de todas as tabelas com tipos de dados PostgreSQL

---

## **Tabela: agendamentos**
```sql
CREATE TABLE agendamentos (
    id                  SERIAL PRIMARY KEY,
    empresa_id          INTEGER NOT NULL REFERENCES empresas(id),
    cliente_id          INTEGER NOT NULL REFERENCES usuarios(id),
    profissional_id     INTEGER NOT NULL REFERENCES usuarios(id),
    servico_id          INTEGER NOT NULL REFERENCES servicos(id),
    data_agendamento    DATE NOT NULL,
    hora_inicio         TIME NOT NULL,
    hora_fim            TIME NOT NULL,
    status              VARCHAR(50) DEFAULT 'agendado',
    observacoes         TEXT,
    valor_total         NUMERIC(10,2),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Colunas:
- `id` → int4, PRIMARY KEY, AUTO_INCREMENT
- `empresa_id` → int4, FOREIGN KEY (empresas.id)
- `cliente_id` → int4, FOREIGN KEY (usuarios.id)
- `profissional_id` → int4, FOREIGN KEY (usuarios.id)  
- `servico_id` → int4, FOREIGN KEY (servicos.id)
- `data_agendamento` → date
- `hora_inicio` → time
- `hora_fim` → time
- `status` → varchar(50)
- `observacoes` → text
- `valor_total` → numeric(10,2)
- `created_at` → timestamp

---

## **Tabela: usuarios**
```sql
CREATE TABLE usuarios (
    id                  SERIAL PRIMARY KEY,
    empresa_id          INTEGER NOT NULL REFERENCES empresas(id),
    nome                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    telefone            TEXT,
    tipo_usuario        VARCHAR(50) DEFAULT 'cliente',
    data_cadastro       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo               BOOLEAN DEFAULT true,
    auth_id             UUID,
    customer_id         TEXT,
    subscription_id     TEXT,
    plano               VARCHAR(50),
    especialidades      VARCHAR(500),
    biografia           TEXT,
    comissao_percentual NUMERIC(5,2),
    usuario_id          INTEGER
);
```

### Colunas:
- `id` → int4, PRIMARY KEY, AUTO_INCREMENT
- `empresa_id` → int4, FOREIGN KEY (empresas.id)
- `nome` → varchar(255)
- `email` → varchar(255), UNIQUE
- `telefone` → text
- `tipo_usuario` → varchar(50) - valores: 'cliente', 'profissional', 'admin'
- `data_cadastro` → timestamp
- `ativo` → boolean
- `auth_id` → uuid (Supabase Auth ID)
- `customer_id` → text (Stripe Customer ID)
- `subscription_id` → text (Stripe Subscription ID)
- `plano` → varchar(50) - valores: 'essencial', 'profissional'
- `especialidades` → varchar(500)
- `biografia` → text
- `comissao_percentual` → numeric(5,2)
- `usuario_id` → int4

---

## **Tabela: empresas**
```sql
CREATE TABLE empresas (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(255) NOT NULL,
    razao_social    VARCHAR(255),
    cnpj            VARCHAR(18),
    email           VARCHAR(255) NOT NULL,
    telefone        VARCHAR(20),
    endereco        TEXT,
    logo_url        TEXT,
    cor_primaria    VARCHAR(7),
    cor_secundaria  VARCHAR(7),
    data_cadastro   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo           BOOLEAN DEFAULT true
);
```

### Colunas:
- `id` → int4, PRIMARY KEY, AUTO_INCREMENT
- `nome` → varchar(255)
- `razao_social` → varchar(255)
- `cnpj` → varchar(18)
- `email` → varchar(255)
- `telefone` → varchar(20)
- `endereco` → text
- `logo_url` → text
- `cor_primaria` → varchar(7)
- `cor_secundaria` → varchar(7)
- `data_cadastro` → timestamp
- `ativo` → boolean

---

## **Tabela: servicos**
```sql
CREATE TABLE servicos (
    id          SERIAL PRIMARY KEY,
    empresa_id  INTEGER NOT NULL REFERENCES empresas(id),
    nome        VARCHAR(255) NOT NULL,
    descricao   TEXT,
    duracao     INTEGER NOT NULL,
    preco       NUMERIC(10,2) NOT NULL,
    ativo       BOOLEAN DEFAULT true,
    tags        TEXT
);
```

### Colunas:
- `id` → int4, PRIMARY KEY, AUTO_INCREMENT
- `empresa_id` → int4, FOREIGN KEY (empresas.id)
- `nome` → varchar(255)
- `descricao` → text
- `duracao` → int4 (em minutos)
- `preco` → numeric(10,2)
- `ativo` → boolean
- `tags` → text

---

## **Tabela: instancias_empresa**
```sql
CREATE TABLE instancias_empresa (
    id                  SERIAL PRIMARY KEY,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nome                TEXT NOT NULL,
    idempresa           INTEGER NOT NULL REFERENCES empresas(id),
    apelido             TEXT,
    numero_whatsapp     TEXT
);
```

### Colunas:
- `id` → int4, PRIMARY KEY, AUTO_INCREMENT
- `created_at` → timestamp
- `nome` → text
- `idempresa` → int4, FOREIGN KEY (empresas.id)
- `apelido` → text
- `numero_whatsapp` → text

---

## **Tabela: horarios_disponiveis**
```sql
CREATE TABLE horarios_disponiveis (
    id              SERIAL PRIMARY KEY,
    empresa_id      INTEGER NOT NULL REFERENCES empresas(id),
    profissional_id INTEGER NOT NULL REFERENCES usuarios(id),
    dia_semana      INTEGER NOT NULL,
    hora_inicio     TIME NOT NULL,
    hora_fim        TIME NOT NULL
);
```

### Colunas:
- `id` → int4, PRIMARY KEY, AUTO_INCREMENT
- `empresa_id` → int4, FOREIGN KEY (empresas.id)
- `profissional_id` → int4, FOREIGN KEY (usuarios.id)
- `dia_semana` → int4 (0=Domingo, 1=Segunda, ..., 6=Sábado)
- `hora_inicio` → time
- `hora_fim` → time

---

## **Tabela: profissional_servico**
```sql
CREATE TABLE profissional_servico (
    id              SERIAL PRIMARY KEY,
    profissional_id INTEGER NOT NULL REFERENCES usuarios(id),
    servico_id      INTEGER NOT NULL REFERENCES servicos(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Colunas:
- `id` → int4, PRIMARY KEY, AUTO_INCREMENT
- `profissional_id` → int4, FOREIGN KEY (usuarios.id)
- `servico_id` → int4, FOREIGN KEY (servicos.id)
- `created_at` → timestamp

---

## **Views/Tabelas Virtuais Mencionadas no Sistema**

### **vw_agendamentos_detalhes**
View que junta agendamentos com dados completos de cliente, profissional, serviço e empresa.

### **vw_profissionais_detalhes**
View que mostra profissionais com suas especialidades, biografias e horários.

### **vw_horarios_disponiveis_detalhados**
View que combina horários disponíveis com dados do profissional.

### **vw_profissional_servico_detalhes**
View que relaciona profissionais com os serviços que podem executar.

---

## **Tipos de Dados e Enums**

### **Enum implícito: tipo_usuario**
- `'cliente'`
- `'profissional'`
- `'admin'`

### **Enum implícito: plano**
- `'essencial'`
- `'profissional'`

### **Enum implícito: status (agendamentos)**
- `'agendado'`
- `'cancelado'`
- `'concluido'`
- `'em_andamento'`

### **Enum implícito: dia_semana**
- `0` = Domingo
- `1` = Segunda-feira
- `2` = Terça-feira
- `3` = Quarta-feira
- `4` = Quinta-feira
- `5` = Sexta-feira
- `6` = Sábado

---

## **Relacionamentos Principais**

### **1:N (Um para Muitos)**
- `empresas.id` → `usuarios.empresa_id`
- `empresas.id` → `servicos.empresa_id`
- `empresas.id` → `agendamentos.empresa_id`
- `empresas.id` → `horarios_disponiveis.empresa_id`
- `empresas.id` → `instancias_empresa.idempresa`
- `usuarios.id` → `agendamentos.cliente_id`
- `usuarios.id` → `agendamentos.profissional_id`
- `usuarios.id` → `horarios_disponiveis.profissional_id`
- `servicos.id` → `agendamentos.servico_id`

### **N:N (Muitos para Muitos)**
- `usuarios` ↔ `servicos` (via `profissional_servico`)

---

## **Índices Recomendados**

```sql
-- Índices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_telefone ON usuarios(telefone);
CREATE INDEX idx_usuarios_auth_id ON usuarios(auth_id);
CREATE INDEX idx_usuarios_customer_id ON usuarios(customer_id);
CREATE INDEX idx_usuarios_subscription_id ON usuarios(subscription_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_horarios_dia_semana ON horarios_disponiveis(dia_semana);
```

---

## **Campos de Integração Externa**

### **Stripe Integration**
- `usuarios.customer_id` → Stripe Customer ID
- `usuarios.subscription_id` → Stripe Subscription ID
- `usuarios.plano` → Tipo de plano contratado

### **Supabase Auth Integration**
- `usuarios.auth_id` → Supabase User ID

### **WhatsApp Integration**
- `instancias_empresa.nome` → Nome da instância Evolution API
- `instancias_empresa.numero_whatsapp` → Número do WhatsApp Business