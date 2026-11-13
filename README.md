# ACTUSProt: site institucional

Site público do ACTUSProt (gestão para associações): apresenta o sistema e recebe o pedido da **avaliação gratuita**. Só CNPJ, nome e sobrenome, e-mail e telefone são obrigatórios. O pedido vai para o gerenciador de licenças (`ACTUS_Gerente`, compartilhado com o ACTUSPro, rota `POST /publico/avaliacao`), que consulta o CNPJ na Receita, cria a associação no **produto ACTUSProt** com a licença de avaliação, provisiona o ACTUSProt na nuvem e manda por e-mail o endereço, o login e a senha inicial. Nada depende de ação manual no gerenciador.

React 19, Vite, Tailwind 4 e TypeScript. Identidade: cinza escuro, branco e vermelho (cores em `src/index.css`), a mesma do sistema. Só arquivos estáticos depois do build. Nasceu de uma cópia do `ACTUSPro_Site`.

## Um gerenciador, dois produtos

O gerenciador atende o ACTUSPro, o ACTUSFit e o ACTUSProt. Toda chamada deste site manda o cabeçalho **`X-Produto: actusprot`** (`src/servicos/api.ts`); o proxy do Vite (`npm run dev`) e o `actusprot-web` da nuvem também põem. Com ele, o gerenciador cria a empresa no produto certo, confere o CNAE de associação (9499-5/00 ou 9430-8/00; outro CNAE não recusa, só gera alerta), usa o endereço `https://<subdomínio>.<domínio do ACTUSProt>` e o "Acesse o sistema" só encontra associações.

O catálogo de módulos é o mesmo nos dois sistemas (mesmas chaves). Os nomes e descrições mostrados aqui vêm de `MODULOS_FIT` em `src/servicos/api.ts` (por exemplo, `areaCliente` aparece como **Área do associado**). Os **preços, campanhas e treinamentos** vêm do gerenciador e são os do ACTUSProt (no gerenciador, Configurações e Treinamentos com o sistema ACTUSProt escolhido; sem valor próprio, o núcleo e os módulos usam os do ACTUSPro).

## Recursos mostrados

A lista fica em `src/App.tsx` (`RECURSOS`). A grade mostra os recursos do núcleo e **um card para cada módulo opcional ativo do ACTUSProt** no catálogo do gerenciador (`GET /publico/avaliacao/disponivel`, com `X-Produto: actusprot`; os módulos só do ACTUSPro, como o Arquivos, não vêm). Os conhecidos (financeiro, área do associado, comercial, rede credenciada, rastreamento) usam o ícone e o texto de `RECURSOS`; **um módulo novo, ativo, entra sozinho**, com o nome e a descrição cadastrados no gerenciador (`cardsDosModulos`), sem novo build. Sem resposta, só os recursos do núcleo aparecem.

O site só mostra o que o ACTUSProt já faz: inclusive fichas de treino (com animação), controle de acesso (catraca, QR code e balcão), avaliação física e frequência/evasão, que são do núcleo do sistema.

## Preços e simulador

A seção **Preços** (`src/componentes/Precos.tsx`) mostra o núcleo, os módulos ativos, os prazos da campanha e os treinamentos; o **Simulador**, no fim da página, repete a tela de contratação do sistema. Os valores vêm de `GET /publico/precos`. Com **Mostrar os preços no site** desligado no gerenciador, ou sem resposta, a seção, o simulador e o link do menu somem.

## Acesse o sistema

O botão **Acesse o sistema** pede o CNPJ da associação (ou o CPF, para quem foi cadastrado assim pela equipe) e consulta `GET /publico/acesso` (`src/componentes/AcessarSistema.tsx`). Cadastrada e ativa na nuvem: o ACTUSProt da associação abre numa nova aba.

A ilustração da página inicial (`src/componentes/PainelBoasVindas.tsx`) é o painel de uma gestora de associação fictícia, montado em HTML.

## Rodar no computador

Requisitos: Node.js 22 e o gerenciador de licenças rodando (porta 3100).

```bash
npm install
npm run dev
```

Abre em `http://localhost:5201` (o site do ACTUSPro usa a 5180 e o do ACTUSFit a 5191; troque com `SITE_PORTA` no `.env.local`). O Vite repassa `/api/*` para o gerenciador (`API_PROXY_TARGET`, padrão `http://127.0.0.1:3100`), sem o prefixo `/api` e com `X-Produto: actusprot`.

Para a avaliação funcionar de ponta a ponta, o gerenciador precisa do autocadastro ligado, de `ACTUSPROT_API_URL` e `SERVICO_CHAVE` (plano SaaS) e do SMTP. Sem isso, o formulário avisa que a avaliação online está indisponível.

## Variáveis (`.env.local`, opcionais)

| Variável | O que é |
| --- | --- |
| `VITE_API_URL` | Endereço da API do gerenciador visto pelo navegador. Padrão `/api` (mesmo endereço do site) |
| `VITE_CONTATO_EMAIL` | E-mail de contato mostrado no site |
| `VITE_CONTATO_WHATSAPP` | WhatsApp de contato, só dígitos com DDI (ex.: `5511999999999`) |
| `SITE_PORTA` | Só no `npm run dev`: porta do site (padrão 5201) |
| `API_PROXY_TARGET` | Só no `npm run dev`: para onde vai o `/api` |

As variáveis `VITE_*` entram no build: depois de mudar, compile de novo.

## Build e publicação

```bash
npm run build
```

Gera a pasta `dist/`. Na nuvem, o site é compilado dentro da imagem `actusprot-web` do `ACTUSProt_API/deploy` (clone este repositório ao lado dos outros; `SITE_DIR` no `deploy/.env`). Ele publica o site em `https://DOMINIO_PROT` e, do `/api`, só deixa passar as rotas públicas da avaliação, do acesso, dos preços e da política para o gerenciador, com `X-Produto: actusprot`. Detalhes no `deploy/README.md` da API.

## Proteções

- Limite de pedidos por IP no gerenciador (`AVALIACAO_MAX_POR_HORA`).
- Campo escondido para robôs: preenchido, o pedido finge sucesso e nada é criado.
- Uma avaliação por CNPJ, para sempre (o CNPJ é único no gerenciador, nos dois produtos); CNPJ desconhecido ou inativo na Receita é recusado.
- CPF não é aceito no pedido: o formulário oferece o WhatsApp e o e-mail de contato. A avaliação com CPF é liberada pela equipe, no gerenciador.
- O acesso só vai por e-mail, o que confirma o endereço.

## Política de privacidade

O site mostra a Política de Privacidade publicada no gerenciador (`GET /publico/politica-privacidade`). Sem versão publicada, vale o texto do próprio site (`src/App.tsx`). O formulário só envia com **Li e aceito a política de privacidade** marcado; com versão publicada, o gerenciador grava o aceite.

> A política publicada no gerenciador hoje é uma só para os dois produtos. Se ela citar o ACTUSPro ou escritórios, publique um texto neutro (ou peça uma política por produto).
