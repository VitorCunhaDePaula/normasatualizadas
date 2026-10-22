CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,        
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,      
  cpf_enc VARCHAR(255) NOT NULL,           
  cpf_hash CHAR(64) NOT NULL UNIQUE,       
  crp_enc VARCHAR(255) NOT NULL,           
  password_hash VARCHAR(255) NOT NULL,     
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user', 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tabelas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  colunas JSON NOT NULL,    
  linhas JSON NOT NULL,     
  ordem INT NOT NULL DEFAULT 0,
  capa VARCHAR(255) NULL,   
  variantes JSON NULL,      
  download_url VARCHAR(255) NULL,
  download_rotulo VARCHAR(120) NULL, -- texto do botão de download; NULL = "Estudos normativos atualizados"
  nota TEXT NULL,            -- texto exibido abaixo da tabela; NULL = não exibe nada
  created_by CHAR(36) NULL,  -- auditoria: admin que criou a tabela; NULL = origem desconhecida (seed/legado)
  updated_by CHAR(36) NULL,  -- auditoria: admin da última alteração; a aplicação deve preencher a cada UPDATE
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tabelas_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_tabelas_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
