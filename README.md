# 💸 GuardeDinheiro

Aplicação desktop para **controle financeiro pessoal**, desenvolvida com Electron, permitindo acompanhar gastos mensais, metas de economia e comparativos ao longo do ano.

O objetivo do projeto foi consolidar conhecimentos em desenvolvimento fullstack, integração frontend/backend e empacotamento de aplicações desktop.

---

## ✨ Funcionalidades

- 🔐 Login e cadastro de usuários
- 💰 Definição de salário e meta de economia (%)
- 🧾 Cadastro de gastos:
  - Somente no mês atual
  - Fixos (todo mês)
  - Parcelados (por X meses)
- 📊 Visualização dos gastos do mês atual
- 📈 Comparativo de gastos de todos os meses
- 🧮 Cálculo automático de saldo disponível
- 🖥️ Aplicação desktop (Windows)

---

## 🛠️ Tecnologias Utilizadas

- **Electron** – Aplicação desktop
- **React** – Frontend
- **Node.js + Express** – Backend
- **SQLite** – Banco de dados local, cada máquina possui o seu
- **Electron Builder** – Empacotamento do aplicativo

---

## 🚀 Como rodar o projeto localmente (modo desenvolvimento)

### Pré-requisitos
- Node.js 18+
- npm

### Backend
- cd backend
- npm install
- npm start

## Frontend
- cd frontend
- npm install
- npm start

--- 

## 🖥️ Gerar o aplicativo (.exe)

### Build do Frontend
- cd frontend
- npm run build

### Instalador com Electron (raiz do projeto)
- npm run build

O aplicativo pode ser instalado e executado em outro computador sem Node ou npm. 

