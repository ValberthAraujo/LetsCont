# Site Let's Cont

## Descrição
Site temporário hospedado no domínio **letscont.org**, criado para apresentação do evento **Let's Cont** e arrecadação de fundos.

---

## Tecnologias Utilizadas

- Front-end: React, CSS Modules, Framer Motion para animações
- Back-end: Python, FastAPI, PostgreSQL (armazenamento de dados e processamento de formulários)

---

## Componentes Front-end (Animações)

### 1. CarouselMotion
- Carrossel de imagens com animação
- Funcionalidades:
  - Navegação automática (autoplay) configurável
  - Botões de avançar e voltar
  - Indicadores (dots) por slide
- Arquivos:
  - `Carrossel.jsx`
  - `carousel.module.css`

---

### 2. FadeIn
- Aplica animação de fade in com leve subida
- Aceita `delay` para ajustar o tempo
- Arquivo: `FadeIn.jsx`

---

### 3. Pop
- Efeito de scale ao clicar (`whileTap`)
- Útil para botões/elementos interativos
- Arquivo: `Pop.jsx`

---

### 4. SwitchPage
- Efeito de transição fade-in ao carregar a página
- Arquivo: `SwitchPage.jsx`

---

## Paleta de Cores

| Cor | Uso | Hex |
|-----|-----|-----|
| Preto | Fundo principal | `#000000` |
| Laranja | Destaques, títulos | `#FF6F00` |
| Roxo escuro | Elementos sombrios | `#4B0082` |
| Vermelho/Carmin | Detalhes chamativos | `#C62828` |
| Branco/Cinza claro | Textos secundários | `#F5F5F5` |

