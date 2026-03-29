import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 3000;

const app = express();
var listaProdutos = [];

app.use(session({
  secret: 'M1nh4Ch4v3S3cr3t4',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 15
  }
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

function estaAutenticado(requisicao, resposta, next) {
  if (requisicao.session.logado) {
    next();
  }
  else {
    resposta.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Autenticação</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <div class="alert alert-danger" role="alert">
                        Você precisa realizar o login para acessar o cadastro de produtos.
                    </div>
                    <a href="/login" class="btn btn-primary">Ir para login</a>
                </div>
            </body>
        </html>
        `);
    resposta.end();
  }
}

app.get('/', estaAutenticado, (req, res) => {
  res.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Menu do sistema</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
    `);

  res.write(`
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="/">Menu</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                Cadastro
                            </a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="/produto">Produto</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="/listaProdutos">Listar Produtos</a></li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/logout">Logout</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `);

  res.write(`
            <div class="container mt-5">
                <h2>Bem-vindo, ${req.session.usuario}</h2>
                <p>Sistema de cadastro de produtos.</p>
            </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </html>
    `);

  res.end();
});

app.get('/produto', estaAutenticado, (requisicao, resposta) => {
  resposta.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Formulário de cadastro de Produto</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <form method="POST" action="/produto" class="row gy-2 gx-3 align-items-center border p-3">
                        <legend>
                            <h3>Cadastro de Produtos</h3>
                        </legend>

                        <div class="row">
                            <label class="colFormLabel" for="codigoBarras">Código de barras</label>
                            <input type="text" class="form-control" id="codigoBarras" name="codigoBarras">
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="descricao">Descrição do produto</label>
                            <input type="text" class="form-control" id="descricao" name="descricao">
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="precoCusto">Preço de custo</label>
                            <input type="text" class="form-control" id="precoCusto" name="precoCusto">
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="precoVenda">Preço de venda</label>
                            <input type="text" class="form-control" id="precoVenda" name="precoVenda">
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="dataValidade">Data de validade</label>
                            <input type="date" class="form-control" id="dataValidade" name="dataValidade">
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="qtdEstoque">Qtd em estoque</label>
                            <input type="text" class="form-control" id="qtdEstoque" name="qtdEstoque">
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="fabricante">Nome do fabricante</label>
                            <input type="text" class="form-control" id="fabricante" name="fabricante">
                        </div>

                        <div class="row mt-3">
                            <button type="submit" class="btn btn-primary">Cadastrar Produto</button>
                        </div>
                    </form>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </html>
    `);
  resposta.end();
});

app.post('/produto', estaAutenticado, (requisicao, resposta) => {
  const codigoBarras = requisicao.body.codigoBarras;
  const descricao = requisicao.body.descricao;
  const precoCusto = requisicao.body.precoCusto;
  const precoVenda = requisicao.body.precoVenda;
  const dataValidade = requisicao.body.dataValidade;
  const qtdEstoque = requisicao.body.qtdEstoque;
  const fabricante = requisicao.body.fabricante;

  if (!codigoBarras || !descricao || !precoCusto || !precoVenda || !dataValidade || !qtdEstoque || !fabricante) {
    let html = `
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Formulário de cadastro de Produto</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <form method="POST" action="/produto" class="row gy-2 gx-3 align-items-center border p-3">
                        <legend>
                            <h3>Cadastro de Produtos</h3>
                        </legend>

                        <div class="row">
                            <label class="colFormLabel" for="codigoBarras">Código de barras</label>
                            <input type="text" class="form-control" id="codigoBarras" name="codigoBarras" value="${codigoBarras}">`;
    if (!codigoBarras) {
      html += `
                            <div class="alert alert-danger" role="alert">
                                Por favor informe o código de barras
                            </div>
            `;
    }
    html += `
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="descricao">Descrição do produto</label>
                            <input type="text" class="form-control" id="descricao" name="descricao" value="${descricao}">`;
    if (!descricao) {
      html += `
                            <div class="alert alert-danger" role="alert">
                                Por favor informe a descrição do produto
                            </div>
            `;
    }
    html += `
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="precoCusto">Preço de custo</label>
                            <input type="text" class="form-control" id="precoCusto" name="precoCusto" value="${precoCusto}">`;
    if (!precoCusto) {
      html += `
                            <div class="alert alert-danger" role="alert">
                                Por favor informe o preço de custo
                            </div>
            `;
    }
    html += `
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="precoVenda">Preço de venda</label>
                            <input type="text" class="form-control" id="precoVenda" name="precoVenda" value="${precoVenda}">`;
    if (!precoVenda) {
      html += `
                            <div class="alert alert-danger" role="alert">
                                Por favor informe o preço de venda
                            </div>
            `;
    }
    html += `
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="dataValidade">Data de validade</label>
                            <input type="date" class="form-control" id="dataValidade" name="dataValidade" value="${dataValidade}">`;
    if (!dataValidade) {
      html += `
                            <div class="alert alert-danger" role="alert">
                                Por favor informe a data de validade
                            </div>
            `;
    }
    html += `
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="qtdEstoque">Qtd em estoque</label>
                            <input type="text" class="form-control" id="qtdEstoque" name="qtdEstoque" value="${qtdEstoque}">`;
    if (!qtdEstoque) {
      html += `
                            <div class="alert alert-danger" role="alert">
                                Por favor informe a quantidade em estoque
                            </div>
            `;
    }
    html += `
                        </div>

                        <div class="row">
                            <label class="colFormLabel" for="fabricante">Nome do fabricante</label>
                            <input type="text" class="form-control" id="fabricante" name="fabricante" value="${fabricante}">`;
    if (!fabricante) {
      html += `
                            <div class="alert alert-danger" role="alert">
                                Por favor informe o nome do fabricante
                            </div>
            `;
    }
    html += `
                        </div>

                        <div class="row mt-3">
                            <button type="submit" class="btn btn-primary">Cadastrar Produto</button>
                        </div>
                    </form>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </html>
        `;

    resposta.write(html);
    resposta.end();
  }
  else {
    listaProdutos.push({
      codigoBarras: codigoBarras,
      descricao: descricao,
      precoCusto: precoCusto,
      precoVenda: precoVenda,
      dataValidade: dataValidade,
      qtdEstoque: qtdEstoque,
      fabricante: fabricante
    });

    const dataUltimoAcesso = new Date();
    resposta.cookie("ultimoAcesso", dataUltimoAcesso.toLocaleString(), { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true });

    resposta.redirect('/listaProdutos');
  }
});

app.get('/listaProdutos', estaAutenticado, (requisicao, resposta) => {
  const ultimoAcesso = requisicao.cookies?.ultimoAcesso || "Nunca acessou";

  resposta.write(`
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Lista de Produtos</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <h3>Produtos cadastrados</h3>
                    <p><strong>Usuário logado:</strong> ${requisicao.session.usuario}</p>
                    <p><strong>Último acesso:</strong> ${ultimoAcesso}</p>

                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Id</th>
                                <th scope="col">Código de barras</th>
                                <th scope="col">Descrição</th>
                                <th scope="col">Preço de custo</th>
                                <th scope="col">Preço de venda</th>
                                <th scope="col">Data de validade</th>
                                <th scope="col">Qtd estoque</th>
                                <th scope="col">Fabricante</th>
                            </tr>
                        </thead>
                        <tbody>
    `);

  for (let i = 0; i < listaProdutos.length; i++) {
    const produto = listaProdutos[i];
    resposta.write(`
            <tr>
                <td>${i + 1}</td>
                <td>${produto.codigoBarras}</td>
                <td>${produto.descricao}</td>
                <td>${produto.precoCusto}</td>
                <td>${produto.precoVenda}</td>
                <td>${produto.dataValidade}</td>
                <td>${produto.qtdEstoque}</td>
                <td>${produto.fabricante}</td>
            </tr>
        `);
  }

  resposta.write(`
                        </tbody>
                    </table>
                    <a href="/produto" class="btn btn-primary">Continuar cadastrando...</a>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </html>
    `);

  resposta.end();
});

app.get('/login', (requisicao, resposta) => {
  const ultimoAcesso = requisicao.cookies?.ultimoAcesso || "Nunca acessou";

  resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Página de Login</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="d-flex align-items-center py-4 bg-body-tertiary">
                <div class="container w-50">
                    <main class="form-signin w-100 m-auto">
                        <form action="/login" method="POST">
                            <h1 class="h3 mb-3 fw-normal">Por favor, faça o login</h1>

                            <div class="form-floating">
                                <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com">
                                <label for="email">Email</label>
                            </div>

                            <div class="form-floating">
                                <input type="password" class="form-control" id="senha" name="senha" placeholder="Password">
                                <label for="senha">Senha</label>
                            </div>

                            <button class="btn btn-primary w-100 py-2 mt-3" type="submit">Login</button>
                            <p class="mt-5 mb-3 text-body-secondary">Último acesso: ${ultimoAcesso}</p>
                        </form>
                    </main>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);

  resposta.end();
});

app.post('/login', (requisicao, resposta) => {
  const email = requisicao.body.email;
  const senha = requisicao.body.senha;

  if (email == "admin@teste.com.br" && senha == "admin") {
    requisicao.session.logado = true;
    requisicao.session.usuario = email;

    const dataUltimoAcesso = new Date();
    resposta.cookie("ultimoAcesso", dataUltimoAcesso.toLocaleString(), { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true });

    resposta.redirect("/");
  }
  else {
    resposta.write(`
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Página de Login</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="d-flex align-items-center py-4 bg-body-tertiary">
                <div class="container w-50">
                    <main class="form-signin w-100 m-auto">
                        <form action="/login" method="POST">
                            <h1 class="h3 mb-3 fw-normal">Por favor, faça o login</h1>

                            <div class="form-floating">
                                <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com">
                                <label for="email">Email</label>
                            </div>

                            <div class="form-floating">
                                <input type="password" class="form-control" id="senha" name="senha" placeholder="Password">
                                <label for="senha">Senha</label>
                            </div>

                            <div class="alert alert-danger mt-3" role="alert">
                                Email ou senha inválidos!
                            </div>

                            <button class="btn btn-primary w-100 py-2" type="submit">Login</button>
                        </form>
                    </main>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
        `);

    resposta.end();
  }
});

app.get('/logout', (requisicao, resposta) => {
  requisicao.session.destroy();
  resposta.redirect('/login');
});

app.listen(porta, host, () => {
  console.log(`Servidor rodando em http://${host}:${porta}`);
});