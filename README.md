## (Projeto feito com auxílio da IA Claude Sonnet 4.6 para fins escolares)
# 🎬 MoacirFilms — App de Filmes React Native

Aplicativo de filmes multiplataforma (iOS, Android e Web) construído com **React Native + Expo**.

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
cd MoacirFilms
npm install
```

### Iniciar

```bash
npm run web      # Abre em http://localhost:8081
npm run android  # Requer Android Studio / emulador
npm run ios      # Requer Xcode (Mac)
npm start        # Menu interativo para escolher plataforma
```

---

## 📦 Dependências

| Pacote | Versão | Função |
|---|---|---|
| `expo` | ~52.0.0 | SDK principal — ambiente de execução, bundler e APIs nativas |
| `react` | 18.3.1 | Biblioteca de UI |
| `react-native` | 0.76.9 | Traduz componentes React em elementos nativos iOS/Android |
| `react-native-web` | ~0.19.13 | Converte componentes RN em HTML/CSS para o browser |
| `react-dom` | 18.3.1 | Renderização no DOM do browser |
| `react-native-safe-area-context` | 4.12.0 | Detecta notch, Dynamic Island e insets do dispositivo |
| `expo-av` | ~15.0.0 | Reprodução de vídeo (MP4) no mobile |
| `@react-native-async-storage/async-storage` | 1.23.1 | Armazenamento persistente de favoritos no mobile |
| `expo-status-bar` | ~2.0.0 | Controle da status bar do dispositivo |
| `@expo/metro-runtime` | ~4.0.0 | Suporte ao Metro bundler na web (substitui webpack) |
| `@babel/core` | ^7.25.0 | Compilador — transforma JSX em código compatível |

---

## 📁 Estrutura de Arquivos

```
MoacirFilms/
├── App.js                              # Entry point — navegação, providers, BackHandler
├── app.json                            # Configuração do Expo (nome, ícone, plataformas)
├── babel.config.js                     # Configuração do Babel
├── package.json                        # Dependências e scripts
└── src/
    ├── components/
    │   ├── CategoryFilter.js           # Chips de categoria em ScrollView horizontal
    │   ├── Footer.js                   # Rodapé — compacto no mobile, completo no desktop
    │   ├── HeroBanner.js               # Banner principal com carrossel automático e crossfade
    │   ├── MovieCard.js                # Card de filme com imagem, rating e favorito
    │   ├── Navbar.js                   # Barra de navegação superior com busca animada
    │   ├── SkeletonCard.js             # Placeholder animado durante carregamento
    │   ├── TransitionOverlay.js        # Overlay da animação de expansão do card
    │   └── VideoPlayer.js              # Player de vídeo (YouTube + MP4, web e mobile)
    ├── context/
    │   ├── FavoritesContext.js         # Estado global dos favoritos com persistência
    │   ├── ScrollContext.js            # Controla visibilidade da navbar/footer no scroll
    │   └── TransitionContext.js        # Animação de expand/collapse do card para tela cheia
    ├── data/
    │   └── movies.js                   # Catálogo de filmes e funções auxiliares de filtro
    └── screens/
        ├── DetailScreen.js             # Tela de detalhes do filme
        └── HomeScreen.js               # Tela principal — banner, filtros e catálogo
```

---

## ✨ Funcionalidades

- **Carrossel de destaques** — banner principal alterna automaticamente entre filmes com `featured: true`, com crossfade suave a cada 6 segundos e navegação manual por dots e setas
- **Catálogo com filtro por categoria** — grid responsivo que se adapta à largura da tela sem espaços vazios
- **Busca em tempo real** — filtra por título, gênero, diretor e elenco
- **Tela de detalhes** — sinopse, elenco, diretor, estatísticas e botões de ação
- **Favoritar** — estado global persistente via AsyncStorage (mobile) e localStorage (web)
- **Player de vídeo** — suporte a YouTube e MP4, com detecção automática do tipo de URL
- **Animação de expansão** — ao tocar num card, ele se expande com animação fluída até abrir a tela de detalhes
- **Navbar/footer dinâmicos** — somem ao rolar para baixo e reaparecem ao rolar para cima
- **Skeleton loading** — cards placeholder animados durante o carregamento
- **Botão voltar nativo** — o botão físico do Android fecha o player ou volta para a home
- **Responsivo** — adapta layout para mobile e desktop/web

---

## 🧩 Componentes utilizados

### React Native (`react-native`)

| Componente | Onde é usado |
|---|---|
| `View` | Base de layout em todos os arquivos |
| `Text` | Toda a tipografia do app — títulos, labels, badges, ícones emoji |
| `ImageBackground` | `HeroBanner` (slides do carrossel), `MovieCard` (pôster), `DetailScreen` (backdrop) |
| `ScrollView` | `HomeScreen` (scroll vertical), `DetailScreen` (scroll vertical), `CategoryFilter` (scroll horizontal) |
| `TouchableOpacity` | Todos os botões e áreas clicáveis do app |
| `TextInput` | `Navbar` (campo de busca) |
| `Modal` | `VideoPlayer` (player de vídeo em popup) |
| `Animated` | `HeroBanner` (crossfade), `MovieCard` (fade-in), `Navbar` (busca), `ScrollContext` (navbar/footer), `TransitionContext` (expand/collapse), `VideoPlayer` (backdrop) |
| `Animated.View` | `App.js`, `HeroBanner`, `MovieCard`, `TransitionOverlay`, `VideoPlayer` |
| `Animated.Image` | `TransitionOverlay` (imagem do filme durante expansão) |
| `StyleSheet` | Todos os arquivos — define os estilos dos componentes |
| `Platform` | `App.js`, `FavoritesContext`, `VideoPlayer` — adapta comportamento entre web, iOS e Android |
| `Dimensions` | `TransitionContext`, `TransitionOverlay` — obtém largura e altura da tela |
| `Linking` | `VideoPlayer` — abre o app do YouTube ou browser no mobile |
| `BackHandler` | `App.js` — intercepta o botão físico voltar do Android |
| `useWindowDimensions` | `Navbar`, `HeroBanner`, `MovieCard`, `SkeletonCard`, `Footer`, `DetailScreen`, `VideoPlayer` — obtém dimensões reativas da janela |

### Expo (`expo-status-bar`)

| Componente | Onde é usado |
|---|---|
| `StatusBar` | `App.js` — controla a cor e estilo da barra de status do dispositivo |

### Expo AV (`expo-av`)

| Componente | Onde é usado |
|---|---|
| `Video` | `VideoPlayer` — reprodução de vídeos MP4 no mobile |
| `ResizeMode` | `VideoPlayer` — define o modo de redimensionamento do vídeo (`CONTAIN`) |

### React Native Safe Area Context (`react-native-safe-area-context`)

| Componente | Onde é usado |
|---|---|
| `SafeAreaProvider` | `App.js` — provedor raiz que detecta os insets do dispositivo |
| `useSafeAreaInsets` | `App.js` — hook que retorna os insets (top, bottom) para posicionar a navbar e o footer corretamente abaixo da status bar e acima da barra de navegação |

### HTML nativo (apenas na web)

| Elemento | Onde é usado |
|---|---|
| `<video>` | `VideoPlayer` — reprodução de vídeos MP4 no browser |
| `<iframe>` | `VideoPlayer` — embed de vídeos do YouTube no browser |

---

## 🎬 Como adicionar filmes

Edite `src/data/movies.js` e adicione um objeto ao array `MOVIES`:

```js
{
  id: 9,                          // ID único
  title: 'Nome do Filme',
  genre: ['Ação', 'Drama'],       // Array de gêneros
  year: 2026,
  rating: 8.5,
  duration: '120 min',
  director: 'Nome do Diretor',
  cast: ['Ator 1', 'Ator 2'],       //Pode adicionar mais atores
  synopsis: 'Descrição do filme.',
  image: 'https://url-do-poster.jpg',       // Imagem do card
  backdrop: 'https://url-do-backdrop.jpg',  // Imagem de fundo
  color: '#e50914',               // Cor de acento (hex)
  featured: false,                // true = aparece no carrossel
  videoUrl: 'https://www.youtube.com/watch?v=ID_DO_VIDEO',      //Vídeo do YouTube ou mp4 da internet
}
```

Para adicionar ao carrossel do banner, defina `featured: true`. Qualquer número de filmes pode ser marcado como destaque.

O campo `videoUrl` aceita qualquer formato de URL do YouTube:
```
https://www.youtube.com/watch?v=ID
https://youtu.be/ID
https://www.youtube.com/embed/ID
```
Ou um link direto para MP4.

---

## 🏗️ Como a navegação funciona

O app não usa React Navigation. A navegação é feita manualmente com `useState` no `App.js`:

- **Home → Detalhes:** o `MovieCard` mede sua posição na tela, chama `expand()` do `TransitionContext`, e o `TransitionOverlay` anima a transição. O `DetailScreen` é renderizado dentro do overlay.
- **Detalhes → Home:** o botão "← Voltar" (ou botão físico do Android) chama `collapse()`, que anima o overlay de volta ao tamanho do card original.
- **Abas:** `Navbar` chama `setActiveTab()`, que muda o filtro exibido na `HomeScreen`.

---

## 📱 Gerar APK (Android)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

O APK gerado pode ser instalado diretamente em qualquer dispositivo Android (habilite "Fontes desconhecidas" nas configurações).

---

© 2026 MoacirFilms · Que os filmes estejam com você
