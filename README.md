# Casa da Prata — E-commerce Headless (Bling ERP + Shopify Storefront API)

Aplicação de E-commerce Headless para a joalheria **Casa da Prata** (*Goiânia - GO · Desde 1996*), especializada em **Prata 925 legítima**, **pedras naturais selecionadas** e **joias personalizadas sob encomenda (Prata 925 & Ouro 18k)**.

---

## Arquitetura & Destaques

- **Integração Híbrida (`Mock Data` + `Shopify Storefront API 2024-10/graphql.json`):**
  - `fetchProductsFromShopify()`: Query GraphQL completa buscando produtos, imagens e variantes com `sku` (vínculo fiscal e de estoque com o **Bling ERP**), `availableForSale` e `quantityAvailable`.
  - `createShopifyCheckout(cartItems)`: Mutation `cartCreate` enviando `merchandiseId`, `quantity` e atributos personalizados (`personalizacao_gravacao`), retornando a `checkoutUrl` oficial da Shopify.
  - **Botão Dev Mode (Canto Inferior Esquerdo):** Alterna em tempo real entre **Modo Mock** e **Modo Shopify Live**, persistindo `SHOPIFY_DOMAIN` e `STOREFRONT_ACCESS_TOKEN` no `localStorage`.
- **Experiência de Joalheria Premium:**
  - **Guia de Medidas Interativo:** Tabela e instruções para descoberta de aro de anel (14 ao 20) e caimento de correntes (40cm a 70cm).
  - **Fluxo Sob Encomenda / Personalizados:** Campo de gravação/especificações + botão direto **"Orçar / Encomendar via WhatsApp"** com mensagem pré-formatada contendo nome da joia, variação e SKU do Bling.
  - **Sacola Lateral (Cart Drawer):** Barra de progresso para **Frete Grátis acima de R$ 249,00**, cálculo automático de **5% OFF no Pix** e parcelamento em **6x sem juros**.
  - **Atendimento Flutuante WhatsApp (Canto Inferior Direito):** Acesso rápido para vendas e dúvidas sobre personalização.

---

## Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (http://localhost:3000)
npm run dev

# 3. Executar testes unitários e validação TypeScript
npm run lint
npx tsx --test src/utils/commerce.test.ts

# 4. Gerar build de produção (pasta ./dist)
npm run build
```

---

## Deploy no GitHub Pages (Automático via GitHub Actions)

O projeto já inclui o workflow `.github/workflows/deploy.yml`, `.npmrc` (`legacy-peer-deps=true`), `package-lock.json` e configuração `base: './'` no `vite.config.ts`:

1. No seu repositório do GitHub, acesse **Settings → Pages**.
2. Em **Build and deployment → Source**, altere de *Deploy from a branch* para **GitHub Actions** (passo obrigatório no GitHub para autorizar a publicação pela Action).
3. Suba as alterações para o GitHub (`git push origin main`).
4. Na aba **Actions**, o workflow **Deploy Casa da Prata to GitHub Pages** executará a checagem TypeScript (`npm run lint`), os testes unitários, o build em `./dist` (com `.nojekyll` e `404.html`) e publicará o site automaticamente.
