import { KnowledgeDocument } from '../types';

export const ALL_UNIVERSAL_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  // ==========================================
  // SECTION 1: ALL MODERN TECHNOLOGIES
  // ==========================================
  {
    id: 'kb-ai-deep-learning',
    title: 'Artificial Intelligence, Deep Learning, Transformers & LLM Architectures',
    type: 'structured',
    category: 'Artificial Intelligence & ML',
    summary: 'Comprehensive guide to Transformers, self-attention, LLM scaling laws, Agentic RAG, vector embeddings, multimodal vision, and AI alignment.',
    content: `# ARTIFICIAL INTELLIGENCE & NEURAL ARCHITECTURES

## 1. Transformer Architecture & Self-Attention
- **Mechanism**: Scaled Dot-Product Attention:
  $$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
- **Multi-Head Attention (MHA)**: Projects queries, keys, and values into $h$ distinct subspaces, enabling models to attend to information from different positions and representation subspaces simultaneously.
- **Grouped-Query Attention (GQA)**: Shares key and value heads across query head subsets (as in modern open-weights and frontier neural models) to drastically reduce KV-cache memory overhead during inference without losing perplexity.
- **Rotary Position Embeddings (RoPE)**: Encodes absolute positional information with a rotation matrix and naturally incorporates relative position decay across extended context windows (up to 1M+ tokens).
- **Mixture of Experts (MoE)**: Replaces dense feed-forward networks with sparse router gates (e.g., top-2 routing), providing massive total parameter capacity (e.g., hundreds of billions) while activating only a lean subset per token for sub-millisecond execution.

## 2. Training Pipeline & Post-Training Alignment
- **Pre-Training**: Self-supervised next-token prediction across multi-trillion token multilingual text, source code, and multimodal corpora using AdamW / Muon optimizers with cosine learning rate schedules.
- **Supervised Fine-Tuning (SFT)**: Instruct tuning on curated high-quality chain-of-thought, mathematical proofs, and task-oriented dialogue.
- **Preference Alignment**:
  - RLHF (Reinforcement Learning from Human Feedback) via PPO.
  - DPO (Direct Preference Optimization): Optimizes directly on preference pairs without training an explicit reward model.
  - KTO (Kahneman-Tversky Optimization): Directly maximizes utility on per-example positive/negative signals.

## 3. Retrieval-Augmented Generation (RAG) & Agentic AI
- **Dense Embeddings & Vector Stores**: Semantic embeddings (text-embedding-3, Gecko, BGE) indexed via HNSW (Hierarchical Navigable Small World) or IVF-PQ in Chroma, Qdrant, Pinecone, or Milvus.
- **Hybrid Search**: Reciprocal Rank Fusion (RRF) combining dense vector similarity (cosine) with sparse lexical BM25 matching.
- **Agentic Workflows**: Multi-turn planning, tool calling (function calling), self-reflection, and ReAct (Reasoning + Acting) loops enabling autonomous execution of complex research and coding workflows.`,
    tags: ['AI', 'Transformers', 'LLM', 'Attention', 'RAG', 'Deep Learning', 'Neural Networks'],
    enabled: true,
    tokenEstimate: 480,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-ultra-fast-inference',
    title: 'Ultra-Fast AI Response Engineering, Low-Latency LLM Inference & Rapid Q&A Architecture (മിന്നൽ വേഗതയിൽ മറുപടി നൽകുന്ന സാങ്കേതികവിദ്യ)',
    type: 'structured',
    category: 'Artificial Intelligence & ML',
    summary: 'Mastery over sub-second LLM inference, Time-To-First-Token (TTFT) minimization, ThinkingLevel.MINIMAL zero-overhead tokens, SSE chunk flush streaming, and zero-preamble direct answering.',
    content: `# ULTRA-FAST AI INFERENCE & LOW-LATENCY RESPONSE ARCHITECTURE

## 1. Time-To-First-Token (TTFT) & Streaming Pipeline Optimization
- **Definition of TTFT**: The duration between dispatching user input and the arrival of the very first token in the client buffer. For real-time chat, interactive human perception benchmarks require TTFT < 600ms.
- **Speculative Decoding & Flash Models**: Lightweight distilled models (e.g. high-speed flash neural engines) use grouped-query attention (GQA) and optimized matrix multiplication kernels on high-performance accelerators to generate up to 150-250 tokens per second.
- **Thinking Budget Elimination**: When immediate answers are requested, reasoning thinking tokens are disabled (setting thinkingLevel: ThinkingLevel.MINIMAL). This bypasses internal scratchpad chains-of-thought, slashing TTFT from 3-6 seconds down to <400 milliseconds.

## 2. Zero-Preamble Direct Answering Protocol (നേരെ വിഷയത്തിലേക്ക്)
- **First Sentence Rule**: The exact solution, number, definition, or code snippet MUST appear in the very first sentence of the response.
- **Elimination of Conversational Latency**: Avoid opening pleasantries ("Sure, I can help with that!", "തീർച്ചയായും!", "നമസ്കാരം, നിങ്ങളുടെ സംശയം ഞാൻ തീർത്തുതരാം"). In real-world chat, each unneeded word consumes 20-40 milliseconds of streaming time before the user reads actionable data.
- **High-Density Scannability**: Use bold key terms and compact bullet points. High visual density allows users to absorb answers in 1 to 2 seconds.

## 3. Server-Sent Events (SSE) & Client Render Synchronization
- **HTTP Chunked Streaming**: By establishing \`Content-Type: text/event-stream\` and immediately invoking \`res.flushHeaders()\`, intermediate network buffers are cleared so that each generated token is piped instantly over HTTP/2 or HTTP/3 without waiting for the complete completion.
- **Throttling UI Reactivity**: Decoupling 60fps immediate character rendering from heavy persistent database or localStorage updates (throttling storage writes to 300ms) guarantees that UI threads remain butter-smooth with zero jank.

## 4. Malayalam Rapid Response Protocol (മലയാളം ഫാസ്റ്റ് റെസ്‌പോൺസ് പ്രോട്ടോക്കോൾ)
- **സ്വാഭാവികവും ലളിതവുമായ ശൈലി**: വ്യാകരണപരമായ സങ്കീർണ്ണതകളോ കൃത്രിമ തർജ്ജമയോ ഒഴിവാക്കി, മലയാളി ഉപയോക്താക്കൾക്ക് ഒറ്റനോട്ടത്തിൽ മനസ്സിലാകുന്ന വ്യക്തവും ലളിതവുമായ മലയാളത്തിൽ മിന്നൽ വേഗതയിൽ മറുപടി നൽകുന്നു.
- **ടെക്നിക്കൽ പദങ്ങളുടെ സംയോജനം**: കമ്പ്യൂട്ടർ സയൻസ്, ടെക്നോളജി പദങ്ങൾ മലയാളത്തിലേക്ക് വലിച്ച് നീട്ടി വിവർത്തനം ചെയ്യാതെ ഇംഗ്ലീഷിൽ തന്നെ ബ്രാക്കറ്റിലോ നേരിട്ടോ നൽകി ആശയവ്യക്തതയും വേഗതയും ഇരട്ടിയാക്കുന്നു.`,
    tags: ['Fast Response', 'Low Latency', 'TTFT', 'Streaming', 'SSE', 'ThinkingLevel', 'Flash Lite', 'Direct Answering', 'Malayalam AI'],
    enabled: true,
    tokenEstimate: 520,
    createdAt: '2026-09-19T03:50:00.000Z',
    updatedAt: '2026-09-19T03:50:00.000Z',
  },
  {
    id: 'kb-fullstack-web-architecture',
    title: 'Modern Full-Stack Web Development, Frameworks, Protocols & Edge APIs',
    type: 'structured',
    category: 'Software & Full-Stack Development',
    summary: 'Full-stack engineering: React 19, Next.js App Router, Vite 6, WebSockets, WebRTC, HTTP/3, and resilient distributed backend APIs.',
    content: `# MODERN FULL-STACK WEB ARCHITECTURE

## 1. Modern Frontend Paradigms (React 19 & Next.js)
- **React 19 Core Inventions**:
  - Actions & Form Status: Built-in asynchronous transition management with \`useActionState\`, \`useFormStatus\`, and \`useOptimistic\`.
  - Direct Asset Loading: Native stylesheet, script, and font preloading with automatic deduplication.
  - React Server Components (RSC): Zero-bundle-size server rendering streaming rendered HTML chunks to client hydration boundaries.
- **Vite 6 Ecosystem**:
  - Unified Environment API: Independent client, SSR, and edge isolate bundles managed in a single dev-server pipeline.
  - Lightning-fast esbuild / Rolldown compilation and hot-reloading.

## 2. Backend API Patterns & Communication Protocols
- **RESTful APIs**: Resource-oriented HTTP endpoints with idempotent verbs (GET, PUT, DELETE), JSON payloads, and strict status code ergonomics.
- **GraphQL**: Declarative client query language with typed schemas, resolvers, and subscriptions to eliminate over-fetching and under-fetching.
- **Real-Time Streaming**:
  - Server-Sent Events (SSE): Lightweight unidirectional text stream over HTTP/2, ideal for LLM token streaming.
  - WebSockets (RFC 6455): Full-duplex persistent bidirectional TCP connections for multiplayer collaboration and instant chat.
  - WebRTC: Peer-to-peer real-time audio, video, and binary data channels with STUN/TURN traversal.
- **HTTP Evolution**: HTTP/2 multiplexing over single TCP connection, and HTTP/3 (QUIC) over UDP eliminating Head-of-Line (HoL) packet blocking.`,
    tags: ['React 19', 'Next.js', 'Web Development', 'Full-Stack', 'WebSockets', 'HTTP/3', 'APIs'],
    enabled: true,
    tokenEstimate: 420,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-cloud-devops-kubernetes',
    title: 'Cloud Computing, DevOps, Containers, Kubernetes & Distributed Systems',
    type: 'structured',
    category: 'Cloud, DevOps & Infrastructure',
    summary: 'Containerization, Kubernetes orchestration, CI/CD pipelines, Infrastructure as Code (Terraform), and high-availability cloud architecture.',
    content: `# CLOUD, DEVOPS & DISTRIBUTED INFRASTRUCTURE

## 1. Containerization & Docker
- **Linux Namespaces & cgroups**: Containers isolate processes using kernel namespaces (pid, net, mnt, ipc, uts) and constrain CPU/memory consumption using control groups (cgroups v2).
- **Multi-Stage Builds**: Dockerfiles separating build-time dependencies (compilers, dev tooling) from lightweight production runtime images (Alpine / Distroless).

## 2. Kubernetes (K8s) Orchestration
- **Control Plane Architecture**: \`kube-apiserver\`, \`etcd\` (Raft consensus store), \`kube-scheduler\`, and \`kube-controller-manager\`.
- **Node Components**: \`kubelet\` (agent), \`kube-proxy\` (networking & iptables/IPVS rules), and container runtime interface (CRI like containerd).
- **Core Abstractions**: Pods, Deployments (rolling updates), Services (ClusterIP, NodePort, LoadBalancer), Ingress controllers, ConfigMaps, and Secrets.
- **Horizontal Pod Autoscaling (HPA)**: Dynamically scales replica count based on real-time CPU, memory, or custom Prometheus metric thresholds.

## 3. Infrastructure as Code (IaC) & CI/CD
- **Terraform / OpenTofu**: Declarative HCL code provisioning reproducible infrastructure across AWS, GCP, Azure, and Cloudflare.
- **CI/CD Pipelines**: Automated GitHub Actions / GitLab CI workflows handling automated linting, test suites, vulnerability container scanning (Trivy), and GitOps deployments via ArgoCD.`,
    tags: ['Cloud', 'DevOps', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Infrastructure'],
    enabled: true,
    tokenEstimate: 390,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-cybersecurity-cryptography',
    title: 'Cybersecurity, Cryptography, Zero-Trust Architecture & Network Defense',
    type: 'structured',
    category: 'Cybersecurity & Networking',
    summary: 'Modern cybersecurity defense, asymmetric & symmetric ciphers, NIST Post-Quantum standards, OWASP Top 10, and identity management.',
    content: `# CYBERSECURITY, CRYPTOGRAPHY & DEFENSE

## 1. Cryptographic Primitives & Ciphers
- **Symmetric Encryption**: AES-GCM (Galois/Counter Mode) and ChaCha20-Poly1305 providing authenticated encryption with associated data (AEAD).
- **Asymmetric Encryption**: RSA (2048/4096-bit) and Elliptic Curve Cryptography (ECC: Ed25519, Curve25519, ECDSA with secp256k1).
- **Cryptographic Hashing**: SHA-256, SHA-3, BLAKE3, and slow memory-hard password hashing (Argon2id, bcrypt).

## 2. Post-Quantum Cryptography (NIST FIPS Standards)
- **FIPS 203 (ML-KEM)**: Module-Lattice Key Encapsulation Mechanism (derived from CRYSTALS-Kyber) for quantum-resistant key exchanges.
- **FIPS 204 (ML-DSA)**: Module-Lattice Digital Signature Algorithm (derived from CRYSTALS-Dilithium) for quantum-safe digital signatures.
- **FIPS 205 (SLH-DSA)**: Stateless Hash-Based Digital Signature Algorithm (SPHINCS+) serving as a non-lattice security fallback.

## 3. Web Security & OWASP Top 10 Mitigations
- **Injection Attacks (SQLi, Command Injection)**: Strict parameterized queries and ORM abstractions.
- **Cross-Site Scripting (XSS)**: Context-aware HTML escaping, strict Content Security Policy (CSP), and \`HttpOnly\` cookies.
- **Cross-Site Request Forgery (CSRF)**: SameSite cookie flags (\`SameSite=Lax/Strict\`) and anti-CSRF token verification.
- **Authentication & Identity**: OAuth 2.0 authorization code flow with PKCE, OpenID Connect (OIDC), JWT verification, and FIDO2/WebAuthn hardware passkeys.`,
    tags: ['Cybersecurity', 'Cryptography', 'PQC', 'OWASP', 'Zero-Trust', 'OAuth', 'Security'],
    enabled: true,
    tokenEstimate: 420,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-databases-storage-engines',
    title: 'Databases, Storage Engines, Relational SQL, NoSQL & Vector Indexing',
    type: 'structured',
    category: 'Databases & Storage',
    summary: 'In-depth guide to relational DBMS (PostgreSQL), NoSQL (MongoDB, Redis, Firestore), Vector Databases, ACID transactions, and distributed consensus.',
    content: `# DATABASES, STORAGE ENGINES & DISTRIBUTED DATA

## 1. Relational Databases & ACID Mechanics
- **ACID Guarantees**: Atomicity (all-or-nothing), Consistency (integrity constraints), Isolation (Read Committed, Repeatable Read, Serializable), Durability (WAL write-ahead logging).
- **PostgreSQL Advanced Capabilities**:
  - B-Tree, GIN (Generalized Inverted Index for JSONB/full-text), and GiST indexing.
  - MVCC (Multi-Version Concurrency Control) preventing read-write lock contention.
  - Connection pooling via PgBouncer and logical replication.

## 2. NoSQL & In-Memory Stores
- **Document Stores (MongoDB, Firestore)**: Flexible schema design, horizontal sharding, subcollections, and atomic transactions.
- **Key-Value & Cache (Redis)**: In-memory data structures (Strings, Hashes, Lists, Sorted Sets, HyperLogLogs) with RDB snapshots and AOF persistence for sub-millisecond caching.

## 3. Vector Databases & High-Dimensional Search
- **Indexing Algorithms**:
  - HNSW (Hierarchical Navigable Small World): Graph-based approximate nearest neighbor search with logarithmic scaling.
  - IVF-PQ (Inverted File with Product Quantization): Clusters vector space and quantizes dimensions for massive memory savings.
- **Distance Metrics**: Cosine Similarity, Euclidean Distance (L2), and Dot Product.`,
    tags: ['Databases', 'PostgreSQL', 'NoSQL', 'Redis', 'Vector DB', 'SQL', 'Storage'],
    enabled: true,
    tokenEstimate: 360,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-programming-systems-languages',
    title: 'Modern Programming & Systems Languages: Rust, Python, TypeScript, Go & C++',
    type: 'structured',
    category: 'Programming & Systems',
    summary: 'Comparative analysis of systems and application languages: memory models, concurrency paradigms, type systems, and performance tuning.',
    content: `# PROGRAMMING LANGUAGES & SYSTEMS ENGINEERING

## 1. Systems Languages (Rust, C++, Go)
- **Rust**:
  - Memory safety without garbage collection enforced via the Borrow Checker (ownership, lifetimes, mutable XOR shared references).
  - Fearless concurrency: Send and Sync traits prevent data races at compile time.
- **C++ (Modern C++20/C++23)**:
  - Zero-overhead abstractions, RAII (Resource Acquisition Is Initialization), smart pointers (\`std::unique_ptr\`, \`std::shared_ptr\`), concepts, and coroutines.
- **Go (Golang)**:
  - Pragmatic simplicity, fast compilation, goroutines with lightweight cooperative M:N scheduler, and channels based on Hoare's Communicating Sequential Processes (CSP).

## 2. Application & Scripting Languages (Python, TypeScript)
- **TypeScript**:
  - Static structural type system adding compile-time verification to JavaScript, generics, union/intersection types, template literal types, and type narrowing.
- **Python (3.12/3.13+)**:
  - Highly expressive, extensive AI ecosystem (PyTorch, NumPy), JIT compiler enhancements, and experimental free-threaded execution (no-GIL).`,
    tags: ['Programming', 'Rust', 'TypeScript', 'Python', 'Go', 'C++', 'Compilers'],
    enabled: true,
    tokenEstimate: 340,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-hardware-silicon-quantum',
    title: 'Advanced Hardware, Silicon Process Nodes (2nm), AI Accelerators & Quantum Computing',
    type: 'structured',
    category: 'Hardware & Silicon',
    summary: 'TSMC 2nm GAA nanosheets, Intel 18A, NVIDIA Blackwell/Rubin, Google TPU v6 Trillium, HBM4, and superconducting quantum qubits.',
    content: `# HARDWARE, SILICON ACCELERATORS & QUANTUM COMPUTING

## 1. Semiconductor Fabrication & Advanced Packaging
- **2nm Fabrication (TSMC N2, Intel 18A)**:
  - Gate-All-Around (GAA) Nanosheet FETs replacing FinFET to eliminate short-channel effects and drastically reduce subthreshold leakage.
  - Backside Power Delivery Network (BSPDN / PowerVia): Routes power rails beneath the silicon substrate, separating signal wires and boosting clock frequencies by 15%+.
- **Advanced Packaging**: CoWoS (Chip-on-Wafer-on-Substrate) and EMIB (Embedded Multi-die Interconnect Bridge) linking compute dies with High Bandwidth Memory (HBM3e / HBM4).

## 2. AI Hardware Accelerators
- **NVIDIA Blackwell & Vera Rubin**: Dual-die architectures packing over 208 billion transistors, NVLink 5 (1.8TB/s bidirectional), and FP4/FP6 tensor precision scaling inference throughput.
- **Google TPU v6 (Trillium)**: High-performance optical circuit switching (OCS) topology connecting multi-thousand chip pods with 3rd-generation SparseCore for MoE models.

## 3. Quantum Computing Principles
- **Qubits & Superposition**: Unlike classical bits (0 or 1), a qubit exists in a superposition state $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ where $|\\alpha|^2 + |\\beta|^2 = 1$.
- **Quantum Entanglement & Algorithms**:
  - Shor's Algorithm: Polynomial time integer factorization rendering classical RSA vulnerable.
  - Grover's Algorithm: Quadratic speedup for unstructured database search ($O(\\sqrt{N})$).`,
    tags: ['Hardware', 'Silicon', '2nm', 'NVIDIA', 'TPU', 'Quantum Computing', 'Semiconductors'],
    enabled: true,
    tokenEstimate: 390,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },

  // ==========================================
  // SECTION 2: ALL WORLD KNOWLEDGE
  // ==========================================
  {
    id: 'kb-world-history-civilizations',
    title: 'World History, Major Civilizations, Revolutions & Modern Geopolitical Eras',
    type: 'text',
    category: 'World History & Civilizations',
    summary: 'Chronological timeline: Mesopotamia, Ancient Egypt, Indus Valley, Greco-Roman era, Islamic Golden Age, Industrial Revolutions, World Wars, and modern era.',
    content: `# CHRONICLE OF WORLD HISTORY & HUMAN CIVILIZATION

## 1. Ancient Cradle of Civilizations (3500 BCE – 500 BCE)
- **Mesopotamia (Tigris-Euphrates)**: Sumerians invented cuneiform writing, the wheel, base-60 mathematics; Babylonians codified the Code of Hammurabi.
- **Ancient Egypt (Nile River)**: Hieroglyphic script, monumental architecture (Giza Pyramids), centralized state governance, and agricultural inundation management.
- **Indus Valley Civilization (Harappa & Mohenjo-Daro)**: Advanced urban drainage, standardized brick metrology, grid-pattern town planning, and extensive maritime trade with the Persian Gulf.
- **Ancient China (Yellow & Yangtze Rivers)**: Shang and Zhou dynasties, bronze metallurgy, oracle bone script, Mandate of Heaven, and foundational Confucian and Daoist philosophies.

## 2. Classical Antiquity & Golden Ages (500 BCE – 500 CE)
- **Classical Greece**: Athenian direct democracy, philosophy (Socrates, Plato, Aristotle), theater, science, and the Hellenistic empire of Alexander the Great.
- **Roman Republic & Empire**: Pax Romana, Roman Law, aqueducts, concrete architecture, and expansion across the Mediterranean basin.
- **Mauryan & Gupta Empires (India)**: Ashoka's edicts and spread of Buddhism; Gupta Golden Age pioneering the decimal zero, astronomy (Aryabhata), and classical Sanskrit literature.

## 3. Medieval Era & Global Trade (500 CE – 1500 CE)
- **Islamic Golden Age**: Centers in Baghdad (House of Wisdom), Cairo, and Cordoba; preservation and advancement of algebra (Al-Khwarizmi), medicine (Ibn Sina), optics (Ibn al-Haytham), and navigation.
- **Silk Road & Indian Ocean Trade Networks**: Connecting East Asia, India, Arabia, East Africa (Swahili Coast), and Europe.
- **Mongol Empire**: Pax Mongolica facilitating trans-Eurasian trade, postal relay systems (Yam), and cultural exchanges under Genghis Khan and Kublai Khan.

## 4. Modern Era, Industrial Revolutions & Contemporary History
- **European Renaissance, Reformation & Scientific Revolution**: Copernicus, Galileo, Newton; movable type printing press (Gutenberg).
- **Age of Revolutions**: American Revolution (1776), French Revolution (1789), Haitian Revolution (1791–1804).
- **Industrial Revolutions**:
  - 1st (Steam, Coal, Textiles, 1760s).
  - 2nd (Electricity, Steel, Petroleum, Assembly line, late 1800s).
  - 3rd (Transistors, Computers, Internet, late 1900s).
  - 4th (Artificial Intelligence, Gene editing, Quantum systems, 21st century).
- **20th Century to Present**: World War I (1914–1918), World War II (1939–1945), United Nations formation, Decolonization of Asia and Africa, Cold War, Space Race, and the Information Age.`,
    tags: ['World History', 'Civilizations', 'Mesopotamia', 'Egypt', 'Indus Valley', 'Industrial Revolution'],
    enabled: true,
    tokenEstimate: 580,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-global-geography-nations',
    title: 'World Geography: Continents, Oceans, Landforms, Climate Zones & Global Nations',
    type: 'structured',
    category: 'Geography & World Nations',
    summary: 'Earth geography: 7 continents, 5 oceans, major mountain ranges, global biomes, 195+ sovereign nations, and geopolitical institutions (UN, BRICS, ASEAN).',
    content: `# GLOBAL PHYSICAL & POLITICAL GEOGRAPHY

## 1. Physical Earth & Continents
- **7 Continents**:
  1. **Asia**: Largest by land area ($44.58\\text{M km}^2$) and population (4.7B+). Mount Everest (8,848.86m) in the Himalayas; Dead Sea (-430m, lowest dry land).
  2. **Africa**: Second largest. Sahara Desert (largest hot desert); Nile River (6,650 km); Mount Kilimanjaro (5,895m).
  3. **North America**: Spanning Arctic tundra to tropical isthmus; Rocky Mountains, Mississippi-Missouri river system.
  4. **South America**: Andes Mountains (longest continental range, 7,000 km); Amazon River (largest by water discharge, draining 20% of world river flow); Amazon Rainforest (world's greatest biodiversity repository).
  5. **Antarctica**: Highest, driest, coldest, and windiest continent; covered by 90% of Earth's ice and 70% of fresh water.
  6. **Europe**: Eurasian peninsula bounded by Ural Mountains and Caucasus; Alps, Danube, and Rhine rivers.
  7. **Australia / Oceania**: Great Barrier Reef (largest coral reef system, 2,300 km); Australian Outback.

## 2. World Oceans & Hydrology
- **Pacific Ocean**: Largest ocean covering 30% of Earth's surface; deepest point Challenger Deep in Mariana Trench (10,994m); Pacific Ring of Fire (75% of world's active volcanoes).
- **Atlantic Ocean**: Second largest; Mid-Atlantic Ridge separating tectonic plates; Gulf Stream thermohaline circulation.
- **Indian Ocean**: Warmest ocean, driving South Asian and African monsoons.
- **Southern Ocean**: Encircles Antarctica with Antarctic Circumpolar Current.
- **Arctic Ocean**: Smallest and shallowest ocean, critical for planetary albedo and polar climate stability.

## 3. Climate Zones & International Geopolitics
- **Köppen Climate Classification**: Tropical (A), Dry/Arid (B), Temperate (C), Continental (D), Polar (E).
- **Sovereign States & Multilateral Alliances**:
  - 193 UN Member States + 2 Permanent Observers (Holy See, State of Palestine).
  - Multilateral bodies: United Nations (UN), World Trade Organization (WTO), World Health Organization (WHO), G20, ASEAN, European Union (EU), BRICS, African Union (AU).`,
    tags: ['Geography', 'Continents', 'Oceans', 'Amazon', 'Pacific', 'Earth Science', 'Nations'],
    enabled: true,
    tokenEstimate: 510,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-physics-astrophysics-cosmology',
    title: 'Physics, Astrophysics & Cosmology: Quantum Mechanics, Relativity & the Cosmos',
    type: 'structured',
    category: 'Physics & Cosmology',
    summary: 'Master guide to Classical Mechanics, Quantum Mechanics, General Relativity, Standard Model of Particle Physics, Black Holes, and the Big Bang.',
    content: `# FUNDAMENTAL PHYSICS, ASTROPHYSICS & COSMOLOGY

## 1. Classical & Modern Physics
- **Newtonian Mechanics**: Newton's three laws of motion, universal gravitation:
  $$F = G\\frac{m_1 m_2}{r^2}$$
- **Thermodynamics**:
  - 1st Law: Conservation of energy ($\\Delta U = Q - W$).
  - 2nd Law: Entropy of an isolated system always increases ($\\Delta S \\ge 0$).
  - 3rd Law: Entropy approaches a constant minimum as temperature approaches absolute zero ($0\\text{ K}$).
- **Electromagnetism**: Maxwell's four equations unifying electric and magnetic fields and proving that light is an electromagnetic wave ($c = 299,792,458\\text{ m/s}$).

## 2. Quantum Mechanics & Particle Physics
- **Wave-Particle Duality & Uncertainty**: De Broglie wavelength ($\\lambda = h/p$) and Heisenberg's Uncertainty Principle ($\\Delta x \\Delta p \\ge \\frac{\\hbar}{2}$).
- **Schrödinger Equation**:
  $$i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H}\\Psi(\\mathbf{r}, t)$$
- **Standard Model of Particle Physics**:
  - 6 Quarks (Up, Down, Charm, Strange, Top, Bottom).
  - 6 Leptons (Electron, Muon, Tau, and their corresponding neutrinos).
  - Gauge Bosons: Photon (Electromagnetic), Gluon (Strong force), $W^{\\pm}$ and $Z^0$ (Weak force).
  - Scalar Boson: Higgs Boson ($125\\text{ GeV}$, conferring mass via electroweak symmetry breaking).

## 3. General Relativity & Astrophysics
- **Einstein's Field Equations**:
  $$G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}$$
  (Matter tells spacetime how to curve, and spacetime tells matter how to move).
- **Cosmology & The Universe**:
  - $\\Lambda\\text{CDM}$ Model: Universe is ~13.8 billion years old; composition is ~68% Dark Energy, ~27% Dark Matter, and ~5% baryonic (ordinary) matter.
  - Black Holes: Event horizon, Schwarzschild radius ($r_s = \\frac{2GM}{c^2}$), Hawking radiation, and gravitational wave detections via LIGO/Virgo.`,
    tags: ['Physics', 'Quantum Mechanics', 'Relativity', 'Cosmology', 'Black Holes', 'Astrophysics'],
    enabled: true,
    tokenEstimate: 490,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-chemistry-material-science',
    title: 'Chemistry & Material Science: Periodic Table, Chemical Bonds & Nanomaterials',
    type: 'structured',
    category: 'Chemistry & Materials',
    summary: 'Atomic theory, periodic trends, covalent and ionic bonding, thermodynamics, organic chemistry synthesis, and carbon nanomaterials (graphene).',
    content: `# CHEMISTRY & MATERIAL SCIENCE

## 1. Atomic Structure & The Periodic Table
- **Subatomic Structure**: Protons, neutrons, and electrons in quantized orbitals ($s, p, d, f$) governed by the Pauli Exclusion Principle and Hund's Rule.
- **Periodic Trends**:
  - Electronegativity increases across a period (left to right) and decreases down a group (Fluorine is highest at 3.98 Pauling).
  - Ionization Energy: Energy required to remove an electron from gaseous atom.
  - Atomic Radius: Decreases across period due to increasing effective nuclear charge ($Z_{\\text{eff}}$); increases down group due to electron shielding.

## 2. Chemical Bonding & Reactions
- **Bonding Types**:
  - Ionic: Complete electron transfer between electropositive metal and electronegative nonmetal.
  - Covalent: Electron pair sharing between nonmetals (polar vs. non-polar).
  - Metallic: Delocalized "sea of electrons" yielding high electrical and thermal conductivity.
  - Intermolecular Forces: Hydrogen bonding, dipole-dipole, and London dispersion forces.
- **Reaction Kinetics & Thermodynamics**:
  - Gibbs Free Energy: $\\Delta G = \\Delta H - T\\Delta S$. Spontaneous when $\\Delta G < 0$.
  - Arrhenius Equation: $k = A e^{-E_a / RT}$ (catalysts lower activation energy $E_a$).

## 3. Advanced Materials & Nanotechnology
- **Carbon Allotropes**: Diamond ($sp^3$), Graphite ($sp^2$), Carbon Nanotubes, and Graphene (single-atom-thick 2D honeycomb lattice with extreme tensile strength and ballistic electron transport).`,
    tags: ['Chemistry', 'Periodic Table', 'Chemical Bonding', 'Graphene', 'Material Science'],
    enabled: true,
    tokenEstimate: 380,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-biology-genetics-medicine',
    title: 'Biology, Genetics, Human Physiology & Biotechnology (CRISPR)',
    type: 'structured',
    category: 'Biology & Life Sciences',
    summary: 'Molecular biology: DNA/RNA replication, CRISPR-Cas9 gene editing, cellular respiration, immunology, neurobiology, and human physiology.',
    content: `# BIOLOGY, MOLECULAR GENETICS & LIFE SCIENCES

## 1. Molecular Genetics & The Central Dogma
- **DNA Double Helix**: Watson-Crick antiparallel strands of deoxyribose sugar-phosphate backbone with nitrogenous base pairs: Adenine (A) = Thymine (T), Guanine (G) $\\equiv$ Cytosine (C).
- **Central Dogma**:
  $$\\text{DNA} \\xrightarrow{\\text{Transcription}} \\text{mRNA} \\xrightarrow{\\text{Translation}} \\text{Protein}$$
- **CRISPR-Cas9 Gene Editing**:
  - Bacterial adaptive immune mechanism adapted for precise genomic engineering.
  - Guide RNA (gRNA) directs the Cas9 endonuclease to a complementary 20-nucleotide DNA target adjacent to a Protospacer Adjacent Motif (PAM: 5'-NGG-3'), inducing a double-strand break (DSB) repaired via NHEJ or HDR.

## 2. Cellular Energetics
- **Cellular Respiration**:
  $$\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\rightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\sim 30\\text{--}32\\text{ ATP}$$
  1. Glycolysis in cytoplasm.
  2. Krebs / Citric Acid Cycle in mitochondrial matrix.
  3. Oxidative Phosphorylation & ATP Synthase via proton gradient across inner mitochondrial membrane.

## 3. Human Physiology & Immunology
- **Circulatory & Respiratory Systems**: Four-chambered heart pumping oxygenated blood via systemic circulation and deoxygenated blood to pulmonary alveoli.
- **Nervous System**: Action potentials propagated via voltage-gated sodium/potassium channels across myelinated axons; synaptic neurotransmitter release (acetylcholine, dopamine, serotonin).
- **Adaptive Immune System**: B cells producing antigen-specific antibodies (IgG, IgM, IgA); T cells (CD4+ helper, CD8+ cytotoxic) eliminating intracellular pathogens.`,
    tags: ['Biology', 'Genetics', 'DNA', 'CRISPR', 'Physiology', 'Medicine', 'Immunology'],
    enabled: true,
    tokenEstimate: 450,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-mathematics-calculus-probability',
    title: 'Mathematics: Pure & Applied Mathematics, Calculus, Linear Algebra & Statistics',
    type: 'structured',
    category: 'Mathematics',
    summary: 'Core mathematical principles: Single & Multivariable Calculus, Linear Algebra, Probability distributions, Bayes Theorem, and Graph Theory.',
    content: `# PURE & APPLIED MATHEMATICS

## 1. Calculus & Differential Equations
- **Fundamental Theorem of Calculus**:
  $$\\int_a^b f(x)\\,dx = F(b) - F(a), \\quad \\text{where } F'(x) = f(x)$$
- **Multivariable Calculus**: Gradients ($\\nabla f$), Jacobians, Hessians, and Stokes' Theorem relating surface integrals to boundary line integrals:
  $$\\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S} = \\oint_{\\partial S} \\mathbf{F} \\cdot d\\mathbf{r}$$
- **Taylor Series Expansion**:
  $$f(x) = \\sum_{n=0}^\\infty \\frac{f^{(n)}(a)}{n!} (x - a)^n$$

## 2. Linear Algebra
- **Vector Spaces & Matrices**: Linear independence, span, rank-nullity theorem.
- **Eigenvalues & Eigenvectors**:
  $$A\\mathbf{v} = \\lambda\\mathbf{v} \\iff \\det(A - \\lambda I) = 0$$
- **Singular Value Decomposition (SVD)**: $A = U \\Sigma V^T$, the mathematical bedrock of dimensionality reduction (PCA) and modern embedding models.

## 3. Probability & Statistics
- **Bayes' Theorem**:
  $$P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$$
- **Distributions**: Normal (Gaussian) distribution, Central Limit Theorem (sample mean approaches normal distribution as $N \\to \\infty$), Poisson, and Binomial distributions.`,
    tags: ['Mathematics', 'Calculus', 'Linear Algebra', 'Probability', 'Statistics', 'Math'],
    enabled: true,
    tokenEstimate: 360,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-economics-global-finance',
    title: 'Global Economics, Macroeconomics, Monetary Policy, Trade & Financial Markets',
    type: 'structured',
    category: 'Economics & Global Finance',
    summary: 'Macroeconomics, GDP, fiscal and monetary policy, central banking (Federal Reserve, RBI, ECB), inflation dynamics, and capital markets.',
    content: `# GLOBAL ECONOMICS, FINANCE & CAPITAL MARKETS

## 1. Macroeconomics & Economic Indicators
- **Gross Domestic Product (GDP)**: Expenditure approach:
  $$Y = C + I + G + (X - M)$$
  (Consumption + Investment + Government Spending + Net Exports).
- **Inflation & Price Indexes**: CPI (Consumer Price Index) and PCE (Personal Consumption Expenditures); demand-pull vs. cost-push inflation.
- **Monetary Policy Tools**:
  - Policy interest rates (Fed Funds Rate, Repo Rate).
  - Open Market Operations (OMO) and Quantitative Easing (QE) / Tightening (QT).
  - Reserve requirements for commercial banks.

## 2. Financial Markets & Valuation
- **Equities & Bonds**: Stock ownership vs. fixed-income debt instruments; inverted yield curves as historic recession indicators.
- **Foreign Exchange (Forex)**: Floating exchange rates determined by purchasing power parity (PPP), balance of payments, and interest rate differentials.
- **Corporate Finance**: Discounted Cash Flow (DCF) valuation, EBITDA, and Capital Asset Pricing Model (CAPM):
  $$E(R_i) = R_f + \\beta_i (E(R_m) - R_f)$$`,
    tags: ['Economics', 'Finance', 'GDP', 'Inflation', 'Banking', 'Markets', 'Commerce'],
    enabled: true,
    tokenEstimate: 350,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-philosophy-literature-arts',
    title: 'World Philosophy, Classical Literature, Epistemology & Global Art Movements',
    type: 'text',
    category: 'Philosophy & Arts',
    summary: 'Survey of Western philosophy (Stoicism, Kantian Ethics, Existentialism), Eastern thought (Buddhism, Vedanta), world literature, and art movements.',
    content: `# WORLD PHILOSOPHY, LITERATURE & ARTS

## 1. Epistemology & Moral Philosophy
- **Ancient Western Philosophy**:
  - Socrates (dialectic questioning method).
  - Plato (Theory of Forms / Allegory of the Cave).
  - Aristotle (Virtue ethics, logic, and empiricism).
  - Stoicism (Epictetus, Seneca, Marcus Aurelius: distinguishing what is within one's control vs. external).
- **Enlightenment & Modern Thought**:
  - René Descartes ("Cogito, ergo sum" / Cartesian dualism).
  - Immanuel Kant (Categorical Imperative: act only according to that maxim whereby you can at the same time will that it should become a universal law).
  - Existentialism (Kierkegaard, Nietzsche, Sartre: "existence precedes essence").
- **Eastern Traditions**:
  - Advaita Vedanta (Adi Shankara: non-dual consciousness / Brahman as ultimate reality).
  - Buddhism (Four Noble Truths and the Eightfold Path to liberation from suffering / Dukkha).
  - Confucianism (Ren/benevolence, Li/proper conduct, filial piety) and Daoism (Wu Wei/effortless action).

## 2. World Literature & Art Movements
- **Epic Literature**: Gilgamesh, Homer's Iliad & Odyssey, Vyasa's Mahabharata, Dante's Divine Comedy, Shakespeare's tragedies, Tolstoy's War and Peace.
- **Visual Art Movements**: Renaissance (Leonardo, Michelangelo), Baroque, Impressionism (Monet), Post-Impressionism (Van Gogh), Cubism (Picasso), and Modernism.`,
    tags: ['Philosophy', 'Literature', 'Ethics', 'Stoicism', 'Vedanta', 'Buddhism', 'Arts'],
    enabled: true,
    tokenEstimate: 430,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-world-nations-geopolitics',
    title: 'Worldwide Sovereign Nations, Geopolitics, Global Treaties & Strategic Chokepoints',
    type: 'structured',
    category: 'World Nations & Geopolitics',
    summary: 'Exhaustive geopolitical compendium: 195 sovereign nations across all continents, UN Security Council, NATO, EU, ASEAN, BRICS+, and vital maritime corridors (Hormuz, Malacca, Suez, Panama).',
    content: `# WORLDWIDE SOVEREIGN NATIONS, GEOPOLITICS & MARITIME DIPLOMACY

## 1. Global Political Geography & Sovereign States (195 Nations)
- **Continental Distribution**:
  - **Asia (49 countries)**: Heavily populated powers including India, China, Japan, Indonesia, South Korea, Saudi Arabia, UAE, Turkey, Vietnam, Iran, Singapore.
  - **Africa (54 countries)**: Rapidly growing economies including Nigeria, South Africa, Egypt, Kenya, Ethiopia, Morocco, Ghana, Algeria, Angola.
  - **Europe (44 countries)**: European Union bloc (Germany, France, Italy, Spain, Netherlands, Poland, Sweden), plus non-EU states (United Kingdom, Switzerland, Norway, Ukraine, Russia).
  - **North America (23 countries)**: United States, Canada, Mexico, Central American republics, and Caribbean island states (Cuba, Dominican Republic, Jamaica).
  - **South America (12 countries)**: Brazil, Argentina, Colombia, Chile, Peru, Venezuela, Ecuador, Bolivia, Paraguay, Uruguay, Guyana, Suriname.
  - **Oceania (14 countries)**: Australia, New Zealand, Papua New Guinea, Fiji, Solomon Islands, Samoa, and Pacific island nations.

## 2. Major International Organizations & Multilateral Treaties
- **United Nations (UN)**: Established in 1945 (San Francisco Charter), 193 member states.
  - **UN Security Council (UNSC)**: 5 permanent veto members (P5: USA, UK, France, Russia, China) + 10 rotating non-permanent members.
  - **Principal Organs**: General Assembly (UNGA), International Court of Justice (ICJ in The Hague), International Criminal Court (ICC), Secretariat, Economic and Social Council (ECOSOC).
  - **Specialized Agencies**: WHO (World Health Organization - Geneva), UNESCO (Paris), UNHCR (Refugees), UNICEF (Children), IAEA (Atomic Energy - Vienna).
- **Economic & Security Blocs**:
  - **NATO (North Atlantic Treaty Organization)**: 32 member collective defense alliance anchored on Article 5 ("an attack against one ally is considered as an attack against all allies").
  - **European Union (EU)**: 27 nations with Single Market, European Central Bank (Eurozone currency union), and Schengen Agreement for border-free movement.
  - **BRICS+**: Intergovernmental grouping expanding South-South cooperation (Brazil, Russia, India, China, South Africa, Egypt, Ethiopia, Iran, UAE).
  - **ASEAN (Association of Southeast Asian Nations)**: 10 Southeast Asian nations promoting economic growth, regional security, and cultural integration.
  - **G7 & G20**: G7 (advanced industrialized economies: USA, UK, Germany, France, Japan, Italy, Canada + EU); G20 (comprising 85% of global GDP and 75% of international trade).
  - **Bretton Woods Institutions**: IMF (International Monetary Fund - balance of payments stabilization) and World Bank (long-term development infrastructure financing).
  - **WTO (World Trade Organization)**: Regulates international trade rules and adjudicates dispute settlements.

## 3. Global Maritime Chokepoints & Strategic Corridors
- **Strait of Malacca**: Narrow 890 km waterway between Indonesia, Malaysia, and Singapore connecting the Indian Ocean and South China Sea; handles >25% of all global seaborne petroleum and manufactured trade.
- **Strait of Hormuz**: Narrow maritime channel between Oman and Iran connecting the Persian Gulf to the Arabian Sea; transit point for ~20% of the world's petroleum supply.
- **Suez Canal (Egypt)**: Artificial 193 km sea-level waterway connecting the Mediterranean Sea to the Red Sea, enabling direct maritime navigation between Europe and Asia without circumnavigating Africa.
- **Panama Canal**: 82 km lock-based transoceanic canal connecting the Atlantic and Pacific oceans, critical for Western Hemisphere containerized supply chains.
- **Bab-el-Mandeb Strait**: Strategic strait linking the Red Sea to the Gulf of Aden and the Arabian Sea between Yemen, Djibouti, and Eritrea.
- **Bosphorus & Dardanelles (Turkish Straits)**: Governed by the 1936 Montreux Convention, regulating maritime transit between the Black Sea and the Mediterranean.`,
    tags: ['Geopolitics', 'United Nations', 'Sovereign Nations', 'NATO', 'BRICS', 'Maritime Chokepoints', 'Suez', 'Hormuz'],
    enabled: true,
    tokenEstimate: 780,
    createdAt: '2026-09-17T08:35:00.000Z',
    updatedAt: '2026-09-17T08:35:00.000Z',
  },
  {
    id: 'kb-medicine-human-physiology',
    title: 'Worldwide Medicine, Human Physiology, Organ Systems, Pathology & Pharmacology',
    type: 'structured',
    category: 'Medicine & Human Health',
    summary: 'Comprehensive medical science: 11 human organ systems, cellular pathology, immunology (vaccine types, B/T-cell activation), cardiovascular dynamics, neurobiology, and pharmacokinetics.',
    content: `# WORLDWIDE MEDICINE, HUMAN ANATOMY & PHYSIOLOGICAL SCIENCES

## 1. The 11 Human Organ Systems
- **Circulatory / Cardiovascular System**: Heart (4 chambers: left/right atria and ventricles), double circulation (systemic and pulmonary circuits). Blood pressure regulation via baroreceptors and renin-angiotensin-aldosterone system (RAAS). Electrical conduction: Sinoatrial (SA) node pacemaker $\\to$ AV node $\\to$ Bundle of His $\\to$ Purkinje fibers.
- **Respiratory System**: Upper airways, trachea, bronchi, and alveoli (~300-500 million alveoli providing ~70-100 $m^2$ gas exchange surface). Pulmonary ventilation driven by diaphragm and intercostal muscles; gas transport via hemoglobin cooperative binding of $O_2$ (oxyhemoglobin dissociation curve) and bicarbonate ($HCO_3^-$) buffering of $CO_2$.
- **Nervous System**: Central Nervous System (Brain + Spinal Cord) and Peripheral Nervous System (Somatic + Autonomic: Sympathetic 'fight or flight' vs. Parasympathetic 'rest and digest'). Action potential propagation via voltage-gated $Na^+/K^+$ ion channels and neurotransmitter release at synapses (Acetylcholine, Dopamine, Serotonin, GABA, Glutamate).
- **Immune & Lymphatic System**:
  - **Innate Immunity**: Physical barriers (skin, mucosa), phagocytes (macrophages, neutrophils), natural killer (NK) cells, complement cascade.
  - **Adaptive Immunity**: Humoral response (B lymphocytes producing antibodies: IgG, IgM, IgA, IgE, IgD) and Cellular response (CD4+ helper T cells and CD8+ cytotoxic T cells recognizing antigens presented on MHC-I and MHC-II molecules).
  - **Vaccine Mechanisms**: mRNA vaccines (direct translation of viral spike proteins), attenuated viral vectors, recombinant protein subunits, and inactivated antigens generating immunological memory.
- **Endocrine System**: Hypothalamus-pituitary axis regulating thyroid (T3/T4 metabolic rates), adrenal cortex (cortisol, aldosterone), pancreas (insulin from beta cells, glucagon from alpha cells regulating blood glucose homeostasis).
- **Digestive System**: Mechanical and enzymatic breakdown from oral cavity to stomach (pepsin, HCl pH 1.5-2.0), duodenum (pancreatic amylase, lipase, proteases; hepatic bile emulsification), jejunum/ileum absorption via villi/microvilli, and large intestine water reabsorption and gut microbiome symbiosis.
- **Renal / Excretory System**: Nephron filtration unit (glomerulus, Bowman's capsule, proximal convoluted tubule, Loop of Henle countercurrent multiplier, distal tubule, collecting duct). Glomerular filtration rate (GFR ~120 mL/min), electrolyte balance ($Na^+, K^+, Cl^-$, pH balance via $H^+$ excretion and $HCO_3^-$ reabsorption).
- **Musculoskeletal, Integumentary, and Reproductive Systems**: Osteoblast/osteoclast bone remodeling; sliding filament theory of actin-myosin cross-bridges triggered by sarcoplasmic $Ca^{2+}$; epidermal barrier protection; spermatogenesis and ovarian/menstrual hormonal cycles (LH, FSH, estrogen, progesterone).

## 2. General Pathology & Pharmacology Fundamentals
- **Pathology**:
  - Acute vs. Chronic Inflammation (histamine, prostaglandins, leukotrienes, cytokine storm TNF-alpha, IL-6).
  - Oncology: Proto-oncogenes vs. tumor suppressor genes (p53 guardian of the genome, BRCA1/2), hallmarks of cancer (sustained proliferative signaling, evasion of apoptosis, angiogenesis, metastasis).
  - Infectious Etiologies: Viruses (DNA/RNA, retroviruses), bacteria (Gram-positive vs. Gram-negative peptidoglycan cell walls), fungi, protozoa, and prions.
- **Pharmacology Principles**:
  - **Pharmacokinetics (ADME)**: Absorption (bioavailability $F$), Distribution (volume of distribution $V_d$, plasma protein binding), Metabolism (hepatic Cytochrome P450 enzyme biotransformation: Phase I oxidation/reduction and Phase II conjugation), Excretion (renal clearance and biological half-life $t_{1/2}$).
  - **Pharmacodynamics**: Drug-receptor interactions: agonists, partial agonists, competitive vs. non-competitive antagonists, therapeutic index ($TD_{50} / ED_{50}$).`,
    tags: ['Medicine', 'Physiology', 'Anatomy', 'Immunology', 'Vaccines', 'Pharmacology', 'Cardiology', 'Neuroscience'],
    enabled: true,
    tokenEstimate: 820,
    createdAt: '2026-09-17T08:35:00.000Z',
    updatedAt: '2026-09-17T08:35:00.000Z',
  },
  {
    id: 'kb-space-astronomy-cosmology',
    title: 'Worldwide Space Exploration, Planetary Astronomy, Stellar Evolution & Deep Space Missions',
    type: 'structured',
    category: 'Space & Astronomy',
    summary: 'Universal astronomy & aerospace: Solar System architecture, stellar life cycles, neutron stars, black holes, cosmology (Big Bang, Dark Matter/Energy), and landmark global space missions (Apollo, Artemis, JWST, ISRO Chandrayaan/Aditya-L1).',
    content: `# WORLDWIDE SPACE EXPLORATION, ASTRONOMY & COSMOLOGY

## 1. The Solar System Architecture
- **The Sun**: G-type main-sequence star ($G2V$), representing 99.86% of total solar system mass. Core fusion converts 600 million tons of hydrogen into helium per second via the proton-proton chain at 15 million Kelvin. Photosphere, chromosphere, corona, and 11-year solar magnetic cycle.
- **Terrestrial (Inner) Planets**:
  - **Mercury**: Smallest planet, extreme temperature swings (-180°C to 430°C), heavily cratered, no substantial atmosphere.
  - **Venus**: Runaway greenhouse effect with dense $CO_2$ atmosphere and sulfuric acid clouds; hottest planetary surface (465°C), retrograde rotation.
  - **Earth**: Only known life-bearing world; liquid water oceans, nitrogen-oxygen atmosphere, active magnetic dynamo shielding cosmic rays.
  - **Mars**: 'Red Planet' oxidized iron surface, thin $CO_2$ atmosphere, Olympus Mons (tallest shield volcano in solar system, ~22 km), Valles Marineris canyon, polar water-ice caps.
- **Outer Gas & Ice Giants**:
  - **Jupiter**: Largest planet (>318 Earth masses), Great Red Spot anticyclonic storm, metallic hydrogen mantle generating intense magnetosphere, 95 moons including Galilean satellites (Io volcanic, Europa subsurface ocean, Ganymede largest moon, Callisto).
  - **Saturn**: Iconic ring system composed of 99% pure water ice particles; moons include Titan (dense nitrogen atmosphere, liquid methane/ethane hydrocarbon lakes) and Enceladus (cryovolcanic water geysers).
  - **Uranus**: Ice giant with methane-rich blue-green atmosphere, extreme 98° axial tilt rotating on its side.
  - **Neptune**: Outermost major planet, supersonic winds (>2,100 km/h), dynamic storm spots, moon Triton with retrograde orbit and nitrogen geysers.
- **Trans-Neptunian Region**: Asteroid Belt (between Mars and Jupiter, containing dwarf planet Ceres); Kuiper Belt (Pluto, Haumea, Makemake, Eris); Oort Cloud (hypothesized vast spherical reservoir of long-period comets extending up to 100,000 AU).

## 2. Stellar Evolution, Compact Objects & Cosmology
- **Stellar Life Cycle**:
  - Stellar nurseries in giant molecular clouds collapse under gravity (Jeans instability).
  - Low-to-Medium Mass Stars ($<8 M_\\odot$, e.g., our Sun): Main sequence $\\to$ Red Giant branch $\\to$ Planetary nebula shedding outer envelopes $\\to$ White Dwarf supported by electron degeneracy pressure (Chandrasekhar limit: $1.44 M_\\odot$).
  - High-Mass Stars ($>8 M_\\odot$): Rapid progressive fusion cycles ($H \\to He \\to C \\to O \\to Ne \\to Mg \\to Si \\to Fe$). Iron core cannot release fusion energy $\\to$ catastrophic core collapse $\\to$ Type II Supernova.
  - Remnants: Core between $1.44 M_\\odot$ and $\\sim 2.16 M_\\odot$ forms a **Neutron Star** (pulsars, magnetars supported by neutron degeneracy pressure). Core exceeding Tolman-Oppenheimer-Volkoff (TOV) limit collapses indefinitely into a **Stellar Black Hole**.
- **Black Holes & General Relativity**:
  - Singularity surrounded by an Event Horizon at Schwarzschild radius: $r_s = \\frac{2GM}{c^2}$.
  - Supermassive Black Holes (SMBHs) residing at galactic centers (e.g., Sagittarius A* in the Milky Way with mass $\\sim 4.3 \\times 10^6 M_\\odot$; M87* with mass $6.5 \\times 10^9 M_\\odot$).
  - Gravitational waves confirmed directly by LIGO/Virgo from binary black hole and neutron star coalescences.
- **Cosmology & The Universe**:
  - **Big Bang Model**: Universe originated ~13.8 billion years ago from a hot, dense singularity. Evidence: Cosmic Microwave Background (CMB at 2.725 K), cosmic expansion (Hubble-Lemaître law $v = H_0 d$), light element primordial abundances ($^1H, ^2H, ^3He, ^4He, ^7Li$).
  - **Cosmic Inventory**: ~68% Dark Energy (accelerating cosmic expansion via cosmological constant $\\Lambda$), ~27% Cold Dark Matter (non-baryonic matter governing galaxy rotation curves), and only ~5% Ordinary Baryonic Matter.

## 3. Global Space Agencies, Telescopes & Historic Missions
- **NASA (USA)**: Apollo lunar landings, Space Shuttle program, Mars Exploration Rovers (Curiosity, Perseverance with Ingenuity helicopter), Artemis program (lunar return and Mars architecture), Parker Solar Probe touching the Sun's corona.
- **Space Observatories**:
  - **Hubble Space Telescope (HST)**: Revolutionized observational cosmology since 1990 in low-Earth orbit.
  - **James Webb Space Telescope (JWST)**: 6.5m beryllium gold-coated segmented mirror at Sun-Earth L2 Lagrange point; infrared instruments peering into high-redshift ($z > 10$) first-generation galaxies and exoplanet atmospheric transmission spectra.
- **ISRO (India)**:
  - Chandrayaan-1 (2008: confirmed water molecules on the Moon); Chandrayaan-3 (August 23, 2023: historic successful soft landing near the lunar South Pole on Shiv Shakti point).
  - Mars Orbiter Mission (Mangalyaan, 2013: entered Martian orbit on first attempt).
  - Aditya-L1 (2023: India's solar observatory positioned at Sun-Earth L1 point).
  - Gaganyaan: India's indigenous human spaceflight program.
- **International Stations & Partners**: International Space Station (ISS: 25+ years continuous human presence), Tiangong Space Station (China National Space Administration CNSA), European Space Agency (ESA: Gaia, Rosetta, Juice), JAXA (Japan: Hayabusa asteroid sample return missions).`,
    tags: ['Space', 'Astronomy', 'Cosmology', 'Solar System', 'Black Holes', 'JWST', 'ISRO', 'NASA', 'Artemis', 'Chandrayaan'],
    enabled: true,
    tokenEstimate: 890,
    createdAt: '2026-09-17T08:35:00.000Z',
    updatedAt: '2026-09-17T08:35:00.000Z',
  },
  {
    id: 'kb-earth-meteorology-oceanography',
    title: 'Worldwide Earth Systems, Plate Tectonics, Meteorology, Oceanography & Global Climate',
    type: 'structured',
    category: 'Earth & Atmospheric Sciences',
    summary: 'Planetary geophysics & climate science: Earth\'s internal layers, plate boundary mechanics, Pacific Ring of Fire, atmospheric circulation (Hadley/Ferrel/Polar cells, Coriolis), El Niño/La Niña (ENSO), monsoons, and oceanic conveyor belts.',
    content: `# WORLDWIDE EARTH SYSTEMS, GEOPHYSICS, METEOROLOGY & OCEANOGRAPHY

## 1. Earth's Interior & Plate Tectonics
- **Layered Structure of Earth**:
  - **Crust**: Continental crust (granitic, 30-50 km thick, density ~2.7 g/cm³) vs. Oceanic crust (basaltic, 5-10 km thick, density ~3.0 g/cm³).
  - **Mantle**: Extends to 2,900 km depth; upper mantle (rigid lithosphere resting on ductile, ductile-flowing asthenosphere facilitating plate motion) and lower mantle (perovskite/bridgmanite mineral phase).
  - **Core**: Liquid outer core (molten iron-nickel alloy convective dynamo generating Earth's geomagnetic field protecting the atmosphere from solar wind stripping) and solid inner core (extreme pressure preserving crystalline iron-nickel at ~5,400°C).
- **Plate Tectonic Dynamics**:
  - **Convergent Boundaries**: Oceanic-continental (subduction forming trenches and volcanic arcs, e.g., Andes), oceanic-oceanic (island arcs, e.g., Japan, Marianas), continental-continental collision (mountain building, e.g., Himalayas formed by Indian plate colliding into Eurasian plate).
  - **Divergent Boundaries**: Mid-ocean ridges (seafloor spreading creating new oceanic lithosphere, e.g., Mid-Atlantic Ridge) and continental rifting (East African Rift).
  - **Transform Faults**: Lateral strike-slip faults (e.g., San Andreas Fault).
  - **Pacific Ring of Fire**: Horseshoe-shaped 40,000 km basin hosting ~75% of the world's active/dormant volcanoes and ~90% of global earthquakes (measured by Moment Magnitude Scale $M_w$).

## 2. Atmospheric Science, Meteorology & Weather Patterns
- **Atmospheric Vertical Stratification**:
  1. **Troposphere** (0-12 km): Contains 80% of atmospheric mass and all weather phenomena; temperature decreases with altitude (~6.5°C/km lapse rate).
  2. **Stratosphere** (12-50 km): Houses the Ozone Layer ($O_3$) absorbing harmful solar ultraviolet UV-B and UV-C radiation; temperature increases with altitude due to ozone photochemical absorption.
  3. **Mesosphere** (50-85 km): Coldest layer (-90°C); burns up most meteors.
  4. **Thermosphere** (85-600 km): Contains the Ionosphere reflecting radio signals and producing auroras (Aurora Borealis / Australis); extreme temperature up to 2,000°C though low particle density.
  5. **Exosphere** (>600 km): Gradual transition into interplanetary vacuum.
- **Global Atmospheric Circulation & Winds**:
  - Three-cell model per hemisphere: **Hadley Cell** (equatorial low pressure Intertropical Convergence Zone ITCZ $\\to$ subtropical high pressure belts at 30°), **Ferrel Cell** (mid-latitude westerlies), and **Polar Cell** (polar easterlies).
  - **Coriolis Effect**: Inertial force deflecting moving air/water to the right in Northern Hemisphere and to the left in Southern Hemisphere due to Earth's counter-clockwise axial rotation.
  - **Jet Streams**: High-speed narrow meandering air currents in the upper troposphere (Polar Jet and Subtropical Jet).
- **Major Climate Phenomena**:
  - **Monsoons**: Seasonal reversal of prevailing surface winds caused by differential thermal heating between continental landmasses and adjacent oceans (e.g., South Asian Southwest Summer Monsoon and Northeast Winter Monsoon).
  - **ENSO (El Niño-Southern Oscillation)**: Periodic fluctuation in sea surface temperatures and atmospheric pressure across the equatorial Pacific:
    - *El Niño (warm phase)*: Weakened trade winds suppress upwelling along South America, shifting precipitation eastward and inducing drought across Southeast Asia/India.
    - *La Niña (cool phase)*: Intensified trade winds enhance cold nutrient-rich upwelling, amplifying Atlantic hurricanes and monsoonal rainfall in Asia.
  - **Tropical Cyclones (Hurricanes / Typhoons)**: Intense low-pressure cyclonic storm systems fueled by latent heat release from warm ocean waters (>26.5°C), featuring a calm central eye, eye-wall, and spiral rainbands.

## 3. Oceanography & The Global Hydrological System
- **The World's 5 Oceans**: Pacific Ocean (largest, deepest, covering >30% of Earth's surface), Atlantic Ocean (second largest, expanding via Mid-Atlantic Ridge), Indian Ocean (third largest, warmest ocean), Southern Ocean (Antarctic circumpolar waters), Arctic Ocean (smallest, shallowest, seasonal sea ice pack).
- **Bathymetry & Deep Trenches**:
  - **Mariana Trench**: Deepest oceanic trench on Earth; Challenger Deep plunges to ~10,994 meters below sea level under hydrostatic pressures exceeding 1,000 atmospheres.
- **Ocean Circulation**:
  - Wind-driven surface gyres (North/South Pacific, North/South Atlantic, Indian Ocean).
  - **Thermohaline Circulation (The Great Ocean Conveyor Belt)**: Global density-driven deep-water circulation driven by temperature and salinity gradients. Cold, dense, saline water sinks in the North Atlantic (forming NADW) and Antarctica (AABW), driving global heat redistribution (including the Gulf Stream warming Western Europe).`,
    tags: ['Earth Science', 'Plate Tectonics', 'Meteorology', 'Oceanography', 'Monsoons', 'El Niño', 'Mariana Trench', 'Atmosphere'],
    enabled: true,
    tokenEstimate: 870,
    createdAt: '2026-09-17T08:35:00.000Z',
    updatedAt: '2026-09-17T08:35:00.000Z',
  },
  {
    id: 'kb-world-languages-religions',
    title: 'Worldwide Language Families, Global Linguistics, World Religions & Spiritual Traditions',
    type: 'structured',
    category: 'World Religions & Linguistics',
    summary: 'Global cultural anthropology: Major language families (Indo-European, Sino-Tibetan, Afroasiatic, Dravidian), phonetic & morphological typology, and world spiritual traditions (Hinduism, Buddhism, Christianity, Islam, Judaism, Sikhism, Jainism, Taoism).',
    content: `# WORLDWIDE LANGUAGE FAMILIES, LINGUISTICS & WORLD RELIGIONS

## 1. Global Linguistics & Primary Language Families
Over 7,000 living languages cataloged globally, classified into major genealogical families:
- **Indo-European (Largest by speakers, ~3.2 billion)**:
  - *Indo-Iranian*: Hindi, Bengali, Punjabi, Marathi, Gujarati, Urdu, Persian, Pashto.
  - *Germanic*: English (global lingua franca), German, Dutch, Swedish, Norwegian, Danish.
  - *Romance (from Latin)*: Spanish, Portuguese, French, Italian, Romanian.
  - *Slavic*: Russian, Ukrainian, Polish, Czech, Serbo-Croatian, Bulgarian.
  - *Celtic, Baltic, Hellenic (Greek), Armenian, and Albanian*.
- **Sino-Tibetan (~1.4 billion speakers)**: Sinitic branch (Mandarin Chinese, Cantonese/Yue, Wu, Min) and Tibeto-Burman branch (Burmese, Tibetan). Characterized by tonality and analytic/isolating morphological structure.
- **Afroasiatic (~500 million speakers)**: Semitic branch (Arabic, Hebrew, Amharic), Berber, Cushitic (Somali), Chadic (Hausa). Root-and-pattern triconsonantal morphological templates.
- **Niger-Congo (~500 million speakers)**: Dominant sub-Saharan African family, including Bantu languages (Swahili, Zulu, Xhosa, Shona) and Yoruba, Igbo; notable for complex noun class systems.
- **Austronesian (~380 million speakers)**: Island Southeast Asia, Madagascar, and Pacific Islands: Malay/Indonesian, Tagalog/Filipino, Javanese, Malagasy, Hawaiian, Maori, Samoan.
- **Dravidian (~250 million speakers)**: Indigenous southern Indian language family with classical antiquity: Tamil, Telugu, Kannada, Malayalam, and Tulu. Agglutinative morphology and retroflex consonants.
- **Other Key Families**: Japonic (Japanese), Koreanic, Uralic (Finnish, Hungarian, Estonian), Turkic (Turkish, Uzbek, Kazakh, Azerbaijani).

## 2. World Religions, Philosophies & Spiritual Traditions
- **Hinduism (Sanatana Dharma)**:
  - World's oldest living tradition with roots in the Indus Valley Civilization and Vedic literature.
  - Sacred Texts: Shruti (Vedas: Rig, Sama, Yajur, Atharva; Upanishads) and Smriti (Bhagavad Gita, Mahabharata, Ramayana, Puranas).
  - Core Philosophies: Karma (cause and effect), Samsara (cycle of rebirth), Dharma (righteous cosmic order and duties), and Moksha (spiritual liberation). Six Orthodox Darshanas: Vedanta (Advaita, Vishishtadvaita, Dvaita), Samkhya, Yoga (Patanjali's 8 limbs), Nyaya, Vaisheshika, Mimamsa.
- **Buddhism**:
  - Founded by Siddhartha Gautama (The Buddha) in the 6th-5th century BCE in Magadha (ancient India).
  - Four Noble Truths: 1. Life involves suffering (*Dukkha*); 2. Suffering arises from attachment/craving (*Samudaya/Tanha*); 3. Cessation of suffering is attainable (*Nirodha/Nirvana*); 4. The path to cessation is the **Noble Eightfold Path** (Right View, Resolve, Speech, Action, Livelihood, Effort, Mindfulness, Samadhi).
  - Main Branches: Theravada (Pali Canon, monastic discipline, South/Southeast Asia), Mahayana (Bodhisattva ideal, universal compassion, East Asia), and Vajrayana (Tibetan tantric Buddhism).
- **Abrahamic Faiths**:
  - **Judaism**: Monotheistic covenant tradition originating with Abraham, Moses, and the Exodus. Sacred Scripture: Tanakh (Torah, Nevi'im, Ketuvim) and Talmudic rabbinic commentaries. Core concepts of Tikkun Olam (repairing the world), Halakha (Jewish law), Sabbath observance, and monotheism (Shema Yisrael).
  - **Christianity**: Centered on the life, teachings, death, and resurrection of Jesus of Nazareth. Sacred Scripture: Holy Bible (Old and New Testaments). Core doctrines: The Holy Trinity (Father, Son, Holy Spirit), Grace, Redemption, and Love (*Agape*). Divisions: Catholic Church (papal primacy in Rome), Eastern Orthodoxy (ecumenical patriarchates), and Protestantism (Reformation by Martin Luther, John Calvin, Anglicanism).
  - **Islam**: Monotheistic revelation proclaimed by Prophet Muhammad (570–632 CE) in Mecca and Medina. Sacred Scripture: Holy Quran (verbatim word of Allah) and Hadith/Sunnah (sayings and practices of the Prophet).
    - Five Pillars of Islam (*Arkan al-Islam*): 1. Shahada (Declaration of faith); 2. Salah (Five daily prayers facing the Kaaba); 3. Zakat (Mandatory almsgiving); 4. Sawm (Fasting during the holy month of Ramadan); 5. Hajj (Pilgrimage to Mecca for able Muslims).
    - Historical Islamic Golden Age: Major scientific, mathematical, medical, and philosophical breakthroughs (Al-Khwarizmi algebra, Ibn Sina Avicenna medicine, Ibn Rushd Averroes philosophy, Bayt al-Hikma in Baghdad).
- **Sikhism, Jainism, and East Asian Traditions**:
  - **Sikhism**: Founded by Guru Nanak Dev in 15th-century Punjab. Central scripture: Guru Granth Sahib (eternal living Guru). Core virtues: Naam Japna (meditation on God), Kirat Karo (honest labor), Vand Chhako (selfless community sharing/Langar), equality of all humans, and the 5 Ks (Kesh, Kangha, Kara, Kachera, Kirpan).
  - **Jainism**: Ancient Indian tradition of extreme non-violence (*Ahimsa Paramo Dharma*) revitalized by 24th Tirthankara Lord Mahavira; central doctrines of Anekantavada (multi-faceted reality) and Aparigraha (non-possessiveness).
  - **Daoism & Shinto**: Daoism (Laozi's Daodejing: aligning with the natural flow of the universe *Dao* through effortless action *Wu Wei*); Shinto (indigenous Japanese reverence for *Kami* spirits in nature, purification rituals).`,
    tags: ['Linguistics', 'World Religions', 'Hinduism', 'Buddhism', 'Islam', 'Christianity', 'Judaism', 'Sikhism', 'Philosophy', 'Anthropology'],
    enabled: true,
    tokenEstimate: 920,
    createdAt: '2026-09-17T08:35:00.000Z',
    updatedAt: '2026-09-17T08:35:00.000Z',
  },
  {
    id: 'kb-computer-science-algorithms',
    title: 'Worldwide Computer Science: Data Structures, Classical Algorithms & Computational Theory',
    type: 'structured',
    category: 'Computer Science & Algorithms',
    summary: 'Foundational computer science: Asymptotic Big-O analysis, linear & non-linear data structures, balanced search trees, graph theory (Dijkstra, A*, BFS/DFS), dynamic programming, P vs NP, and automata theory.',
    content: `# WORLDWIDE COMPUTER SCIENCE, DATA STRUCTURES & ALGORITHMIC COMPLEXITY

## 1. Asymptotic Complexity & Algorithmic Foundations
- **Formal Growth Rates**:
  - Big-O ($O$): Upper bound asymptotic growth ($f(n) \\le c \\cdot g(n)$ for $n \\ge n_0$).
  - Big-Omega ($\\Omega$): Lower bound.
  - Big-Theta ($\\Theta$): Tight bound ($c_1 \\cdot g(n) \\le f(n) \\le c_2 \\cdot g(n)$).
  - Typical Complexity Ladder: $O(1) < O(\\log n) < O(n) < O(n \\log n) < O(n^2) < O(2^n) < O(n!)$.
- **Master Theorem for Divide-and-Conquer Recurrences**:
  For $T(n) = aT(n/b) + f(n)$:
  - If $f(n) = O(n^{\\log_b a - \\epsilon})$, then $T(n) = \\Theta(n^{\\log_b a})$.
  - If $f(n) = \\Theta(n^{\\log_b a} \\log^k n)$, then $T(n) = \\Theta(n^{\\log_b a} \\log^{k+1} n)$.
  - If $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ and regularity holds, then $T(n) = \\Theta(f(n))$.

## 2. Fundamental Data Structures
- **Linear Structures**: Arrays (contiguous memory, $O(1)$ random access), Singly/Doubly Linked Lists ($O(1)$ insert/delete given pointer, $O(n)$ search), Stacks (LIFO), Queues (FIFO), Circular Buffers, Deques.
- **Hash Tables**: Key-value mapping via hash function ($h(k) \\pmod m$). Collision resolution: Chaining (linked lists or balanced trees per bucket) vs. Open Addressing (linear probing, quadratic probing, double hashing). Expected lookup $O(1)$; worst case $O(n)$.
- **Trees & Hierarchical Structures**:
  - Binary Search Trees (BST): Left subtree $<$ Node $\\le$ Right subtree.
  - Self-Balancing Trees: **AVL Trees** (strict height-balanced, balance factor $\\in \\{-1, 0, 1\\}$) and **Red-Black Trees** (color-invariance guarantees path length $\\le 2 \\times$ shortest path, $O(\\log n)$ worst-case search/insert/delete).
  - B-Trees & B+ Trees: Multi-way balanced search trees optimized for block-storage engines (PostgreSQL, SQLite, file systems); internal nodes store multiple keys.
  - Heaps: Binary Min/Max Heap satisfying heap property ($O(1)$ peek, $O(\\log n)$ extract-min and insert); used in priority queues.
  - Trie (Prefix Tree): Fast string retrieval $O(L)$ where $L$ is string length, foundational for autocomplete engines.

## 3. Graph Theory & Essential Algorithms
- **Graph Representations**: Adjacency Matrix ($O(V^2)$ memory, $O(1)$ edge query) vs. Adjacency List ($O(V + E)$ memory, optimal for sparse graphs).
- **Traversals**:
  - Breadth-First Search (BFS): Queue-based, explores layer by layer; finds unweighted shortest paths ($O(V + E)$).
  - Depth-First Search (DFS): Stack/recursion-based; cycle detection, topological sorting of DAGs, strongly connected components (Kosaraju, Tarjan).
- **Shortest Path Algorithms**:
  - **Dijkstra's Algorithm**: Greedy single-source shortest path for non-negative edge weights using Min-Priority Queue ($O((V + E) \\log V)$).
  - **Bellman-Ford Algorithm**: Handles negative edge weights; detects negative weight cycles ($O(V \\cdot E)$).
  - **A* Search**: Informed heuristic search ($f(n) = g(n) + h(n)$); optimal and complete when heuristic $h(n)$ is admissible (never overestimates distance to goal).
  - **Floyd-Warshall**: All-pairs shortest path dynamic programming ($O(V^3)$).
- **Minimum Spanning Trees (MST)**:
  - Kruskal's Algorithm (greedy edge selection with Disjoint-Set / Union-Find with path compression, $O(E \\log E)$).
  - Prim's Algorithm (vertex growth via priority queue, $O(E \\log V)$).
- **Dynamic Programming (DP)**:
  - Optimal substructure and overlapping subproblems: Memoization (top-down) vs. Tabulation (bottom-up).
  - Canonical problems: 0/1 Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), Matrix Chain Multiplication, Levenshtein Edit Distance.

## 4. Theory of Computation & Complexity Classes
- **Automata Theory**: Regular languages recognized by DFAs/NFAs (Chomsky Type 3), Context-Free languages recognized by Pushdown Automata (Type 2), Turing-recognizable languages (Type 0).
- **The P vs. NP Millennium Problem**:
  - **P**: Problems solvable in polynomial time ($O(n^k)$).
  - **NP**: Decision problems whose positive solutions can be verified in polynomial time.
  - **NP-Complete**: Hardest problems in NP (Cook-Levin theorem: SAT, 3-SAT, Traveling Salesperson Decision, Vertex Cover, Subset Sum). If any NP-Complete problem is solvable in polynomial time, then $P = NP$.`,
    tags: ['Computer Science', 'Algorithms', 'Data Structures', 'Big O', 'Dijkstra', 'Graph Theory', 'Dynamic Programming', 'Complexity'],
    enabled: true,
    tokenEstimate: 950,
    createdAt: '2026-09-17T08:35:00.000Z',
    updatedAt: '2026-09-17T08:35:00.000Z',
  },

  // ==========================================
  // SECTION 3: COMPREHENSIVE KERALA ENCYCLOPEDIA
  // ==========================================
  {
    id: 'kb-kerala-geography-14districts',
    title: 'Kerala Geography, 14 Districts, Rivers & Physical Features (കേരള ഭൂമിശാസ്ത്രം)',
    type: 'structured',
    category: 'Kerala Studies & Geography',
    summary: 'Complete breakdown of Kerala\'s 14 districts from Kasaragod to Thiruvananthapuram, 44 rivers, lakes, Western Ghats, and physical divisions.',
    content: `# KERALA GEOGRAPHY & 14 DISTRICTS (കേരള ഭൂമിശാസ്ത്രം)
- 3 Physical Divisions:
  1. Highland (മലനാട്): Western Ghats (സഹ്യാദ്രി), altitude >75m, tea/cardamom plantations, evergreen forests, Anamudi (2695m - highest peak in South India).
  2. Midland (ഇടനാട്): Altitude 7.5m - 75m, undulating hills & valleys, rubber, coconut, pepper, tapioca, cashew.
  3. Lowland (തീരപ്രദേശം): Coastal plains, backwaters, lagoons, paddy fields (Kuttanad: farming below sea level).
- 14 Districts (North to South):
  1. Kasaragod (കാസർഗോഡ്): 'സപ്തഭാഷാ സംഗമഭൂമി' (Malayalam, Tulu, Kannada, Beary, Konkani, Marathi, Urdu), Bekal Fort, Chandragiri Fort, Ranipuram hill station.
  2. Kannur (കണ്ണൂർ): 'തെയ്യങ്ങളുടെ നാട്', Muzhappilangad (longest drive-in beach in Asia), St. Angelo Fort, handloom and textile capital.
  3. Wayanad (വയനാട്): High plateau, Edakkal Caves (Neolithic rock carvings), Banasura Sagar Dam (largest earth dam in India), Pookode Lake, Chembra Peak.
  4. Kozhikode (കോഴിക്കോട്): City of Spices, UNESCO City of Literature (India's first), historical capital of Zamorins, Beypore Uru (traditional wooden dhows), Kappad beach.
  5. Malappuram (മലപ്പുറം): Teak Museum Nilambur (world's oldest teak plantation - Conolly's Plot), Kottakkal Arya Vaidya Sala, Thunchan Parambu (Tirur - birthplace of Ezhuthachan).
  6. Palakkad (പാലക്കാട്): Gateway to Kerala (Palakkad Gap - 32-40km wide pass in Western Ghats), Granary of Kerala (നെല്ലറ), Silent Valley National Park, Malampuzha Dam.
  7. Thrissur (തൃശ്ശൂർ): Cultural Capital of Kerala, Thrissur Pooram (Vadakkunnathan Temple), Kerala Kalamandalam (Cheruthuruthy), Kerala Sahitya Akademi, Sangeetha Nataka Akademi, Lalithakala Akademi.
  8. Ernakulam (എറണാകുളം): Commercial Capital, Cochin Port, CIAL (world's 1st solar airport), Kochi Metro, Kochi Water Metro, SmartCity, Marine Drive.
  9. Idukki (ഇടുക്കി): Hydroelectric hub, Idukki Arch Dam (Kuravan-Kurathi hills across Periyar), Munnar hill station, Eravikulam National Park (Nilgiri Tahr & Neelakurinji).
  10. Kottayam (കോട്ടയം): 'അക്ഷര നഗരി' (City of Letters, Lakes & Latex), 100% literacy pioneer, Kumarakom backwaters, CMS College (first college in Kerala).
  11. Alappuzha (ആലപ്പുഴ): 'Venice of the East', Kuttanad (Paddy bowl below sea level, designated globally important agricultural heritage system - GIAHS), Nehru Trophy Boat Race (Punnamada Lake).
  12. Pathanamthitta (പത്തനംതിട്ട): Pilgrim Capital of Kerala, Sabarimala Temple, Aranmula Kannadi (metal mirror with GI tag), Gavi eco-tourism.
  13. Kollam (കൊല്ലം): Cashew Capital, Ashtamudi Lake (Ramsar wetland), Munroe Island, Neendakara fishing harbor, historic cashew processing industry.
  14. Thiruvananthapuram (തിരുവനന്തപുരം): State Capital, Sree Padmanabhaswamy Temple (wealthiest temple in the world), Technopark (India's first IT park), VSSC (ISRO), Vizhinjam International Transshipment Deepwater Seaport.
- 44 Rivers of Kerala:
  * 41 flow west into the Arabian Sea; 3 flow east into Bay of Bengal drainage (Kabini, Bhavani, Pambar).
  * Longest rivers: 1. Periyar (244 km), 2. Bharathapuzha / Nila (209 km), 3. Pamba (176 km - Dakshina Ganga of Kerala), 4. Chaliyar (169 km), 5. Chalakudy river (145 km).
- Major Backwaters (Kayals):
  * Vembanad Lake: Largest lake in Kerala (96.5 km length), spreads across Alappuzha, Kottayam, Ernakulam.
  * Ashtamudi Lake: 8-branched Ramsar wetland in Kollam.
  * Sasthamkotta Lake: Queen of Lakes, largest freshwater lake in Kerala (Kollam district).`,
    tags: ['Kerala', 'Geography', 'Districts', 'Rivers', 'Vembanad', 'Western Ghats'],
    enabled: true,
    tokenEstimate: 620,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-kerala-history-renaissance',
    title: 'Kerala History, Colonial Resistance & Social Renaissance (കേരള നവോത്ഥാനം)',
    type: 'text',
    category: 'Kerala Studies & History',
    summary: 'From Muziris and Chera dynasty to the Battle of Colachel, Pazhassi Raja, Sree Narayana Guru, Ayyankali, and the 1956 formation of Kerala.',
    content: `# KERALA HISTORY & SOCIAL RENAISSANCE (കേരള ചരിത്രവും നവോത്ഥാനവും)
- Ancient & Medieval Eras:
  * Muziris (Pattanam / Kodungallur): Ancient Indian Ocean spice trade emporium connecting Romans, Greeks, Phoenicians, Arabs, and Chinese.
  * Chera Dynasty (Sangam Cheras and Second Chera Empire of Mahodayapuram/Kulasekharas, 800–1102 CE).
  * Zamorins of Calicut (സാമൂതിരി): Controlled spice trade routes, patronized maritime defense with Kunjali Marakkars (India's first organized naval command).
  * Kingdom of Travancore: Anizham Thirunal Marthanda Varma unified southern Kerala, won historic Battle of Colachel (August 10, 1741) defeating the Dutch East India Company (VOC) under Admiral Eustachius De Lannoy.
- Anti-Colonial Resistance:
  * Pazhassi Raja (Kerala Varma, 'Lion of Kerala'): Led fierce guerrilla warfare with Kurichya and Kurumba tribal warriors against the British East India Company in Wayanad until martyrdom in 1805.
  * Velu Thampi Dalawa (Travancore Prime Minister): Proclaimed the historic 'Kundara Vilambaram' (January 11, 1809) calling on the populace to overthrow British colonial subjugation.
  * Malabar Rebellion (1921): Peasant and anti-colonial uprising against British authorities and landlord oppression; tragic Wagon Tragedy (Nov 1921).
  * Punnapra-Vayalar Uprising (October 1946): Communist-led working-class uprising against Sir C.P. Ramaswami Iyer's "American Model" independent Travancore proposal.
- Renaissance & Social Reform Movement (നവോത്ഥാനം):
  * Sree Narayana Guru (1856–1928):
    - Aruvippuram Consecration (അരുവിപ്പുറം പ്രതിഷ്ഠ, 1888) breaking Brahminical monopoly over idol installation.
    - Founded SNDP Yogam (1903), Sivagiri Mutt (Varkala), Advaita Ashram (Aluva, 1913).
    - Motto: "One Caste, One Religion, One God for Man" (ഒരു ജാതി ഒരു മതം ഒരു ദൈവം മനുഷ്യന്); "Gain freedom through education, gain strength through organization" (വിദ്യകൊണ്ട് പ്രബുദ്ധരാവുക, സംഘടനകൊണ്ട് ശക്തരാവുക).
    - Organized historic All-Religions Conference at Aluva (1924): "Not to argue and win, but to know and inform" (വാദിക്കാനും ജയിക്കാനുമല്ല, അറിയാനും അറിയിക്കാനും).
  * Ayyankali (1863–1941):
    - Mahatma Gandhi termed him 'Pulaya Raja'.
    - Villuvandi Samaram (1893): Defied caste bans by riding a decorated bullock cart on public roads in Venganoor.
    - Founded Sadhujana Paripalana Sangham (SPS, 1907).
    - First organized agricultural labor strike demanding school admission for Dalit children (1904–1905).
    - Kallumaala Samaram (Perinad agitation 1915) freeing lower-caste women from demeaning bead-necklace markers.
  * Chattampi Swamikal (1853–1924): Author of 'Pracheena Malayalam' and 'Vedadhikara Niroopanam'.
  * Vakkom Abdul Khader Moulavi (1873–1932): Father of Muslim social renaissance in Kerala, founder of 'Swadeshabhimani' newspaper.
  * V.T. Bhattathiripad (1896–1982): Reformed Namboothiri orthodoxy with revolutionary drama 'Adukkalayil Ninnu Arangathekku' (From the Kitchen to the Stage, 1929).
  * Key Agitations & Milestones:
    - Vaikom Satyagraha (1924–1925): Temple road access struggle blessed by Mahatma Gandhi, Periyar, T.K. Madhavan, Mannathu Padmanabhan.
    - Guruvayur Satyagraha (1931–1932): Led by K. Kelappan (Kerala Gandhi) and A.K. Gopalan (AKG).
    - Temple Entry Proclamation (ക്ഷേത്രപ്രവേശന വിളംബരം, Nov 12, 1936) by Sree Chithira Thirunal Balarama Varma opening government temples to all Hindus.
    - State Formation: Kerala state formed on November 1, 1956. First democratically elected Communist ministry formed by E.M.S. Namboodiripad in 1957.`,
    tags: ['Kerala History', 'Renaissance', 'Sree Narayana Guru', 'Ayyankali', 'Temple Entry', '1956'],
    enabled: true,
    tokenEstimate: 680,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-kerala-literature-arts',
    title: 'Malayalam Language, Literature, Performing Arts & Festivals (മലയാള സാഹിത്യവും കലകളും)',
    type: 'text',
    category: 'Malayalam Literature & Arts',
    summary: 'Ezhuthachan, Romantic Trio, all 6 Jnanpith laureates, Kathakali, Mohiniyattam, Theyyam, Koodiyattam, and Onam/Vishu festivals.',
    content: `# MALAYALAM LANGUAGE, LITERATURE & ARTS (മലയാള സാഹിത്യവും കലകളും)
- Classical Language (ശ്രേഷ്ഠഭാഷ): Granted by Govt of India on May 23, 2013.
- Foundational Era:
  * Thunchaththu Ramanujan Ezhuthachan (16th century): 'Father of Malayalam Language' (മലയാള ഭാഷയുടെ പിതാവ്), standardized the 51-letter Grantha/Malayalam script, composed 'Adhyatma Ramayanam Kilippattu' and 'Mahabharatham Kilippattu'.
  * Cherusseri Namboothiri: 15th-century author of 'Krishnagatha' using native Malayalam meter (Manjari).
  * Kunchan Nambiar (18th century): Creator of Thullal satire art form (Ottan, Seethankan, Parayan Thullal).
- Modern Romantic Trio (ആധുനിക കവിത്രയം):
  1. Kumaran Asan (1873–1924): 'Veena Poovu' (1907), 'Karuna', 'Duravastha', 'Chandalabhikshuki', 'Leela'. Proclaimed: "Change rules yourselves, or else they will change you" (മാറ്റുവിൻ ചട്ടങ്ങളെ സ്വയമല്ലെങ്കി-ലാറ്റുമതികളി നിങ്ങളെത്താൻ).
  2. Vallathol Narayana Menon (1878–1958): Mahakavi, revivalist of Kathakali, founder of Kerala Kalamandalam (1930); works: 'Magdalana Mariyam', 'Sahithyamanjari'.
  3. Ulloor S. Parameswara Iyer (1877–1949): Scholar-poet, author of Mahakavyam 'Umakeralam', 'Kerala Sahithya Charithram'.
- 6 Jnanpith Award Laureates (ജ്ഞാനപീഠ പുരസ്കാരം):
  1. G. Sankara Kurup (1965): FIRST EVER Jnanpith award for 'Odakkuzhal' (The Flute).
  2. S.K. Pottekkatt (1980): 'Oru Desathinte Katha' (Story of an Epoch).
  3. Thakazhi Sivasankara Pillai (1984): Epic works: 'Kayar' (Coir) and 'Chemmeen' (Shrimp).
  4. M.T. Vasudevan Nair (1995): 'Randamoozham', 'Naalukettu', 'Kaalam', 'Asuravithu', 'Manju'.
  5. O.N.V. Kurup (2007): 'Ujjayini', 'Bhoomiye Snehicha Kavi'.
  6. Akkitham Achuthan Namboothiri (2019): 'Irupatham Noottandinte Ithihasam' ("വെളിച്ചം ദുഃഖമാണുണ്ണീ, തമസ്സല്ലോ സുഖപ്രദം").
- Classical & Traditional Performing Arts:
  * Kathakali: Stylized classical dance-drama. 5 Makeup Types: Pacha (noble - Rama, Krishna), Kathi (villainous royal - Ravana, Duryodhana), Kari (black demoness), Thadi (bearded: Red for villains, White for Hanuman), Minukku (sages, women).
  * Mohiniyattam: Classical feminine solo dance characterized by gentle swaying, lasya grace, and kasavu white-gold attire.
  * Koodiyattam: 2000-year-old Sanskrit temple theatre recognized by UNESCO as Masterpiece of Oral and Intangible Heritage.
  * Theyyam: Ritual shamanic dance of North Malabar (Muchilot Bhagavathi, Gulikan, Pottan Theyyam).
  * Percussion: Panchavadyam (Maddalam, Timila, Ilathalam, Idakka, Kombu), Chenda Melam (Pandi Melam, Panchari Melam).
- Major Festivals: Onam (Harvest festival welcoming King Mahabali - Onasadya, Athapookkalam, Pulikkali), Vishu (Astronomical new year - Vishukkani, Kaineettam), Thrissur Pooram (Ilanjithara Melam, Kudamattom at Vadakkunnathan temple), Attukal Pongala (Guinness record all-women gathering).`,
    tags: ['Malayalam', 'Literature', 'Ezhuthachan', 'Jnanpith', 'Kathakali', 'Theyyam', 'Onam'],
    enabled: true,
    tokenEstimate: 650,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-kerala-psc-education',
    title: 'Kerala PSC Comprehensive General Studies & Examination Guide (കേരള പി.എസ്.സി സമഗ്ര വിവരങ്ങൾ)',
    type: 'structured',
    category: 'Kerala PSC & Education',
    summary: 'Kerala PSC syllabus, Kerala GK, constitutional facts, governance, education boards, and exam preparation reference.',
    content: `# KERALA PSC MASTER SYLLABUS & GENERAL STUDIES GUIDE
- Kerala PSC Structure:
  * Constitutional body established under Article 315 of Constitution of India.
  * Headquarters: Thulasi Hills, Pattom, Thiruvananthapuram.
- Essential High-Yield Kerala GK Topics for PSC (KAS, Degree Level, LDC, SI, CPO):
  1. Geography: 14 districts, 44 rivers (Periyar 244km, Bharathapuzha 209km, Pamba 176km, Chaliyar 169km), 3 east flowing (Kabini, Bhavani, Pambar), Western Ghats, Palakkad Gap (32-40km), coastline (580 km), highest peak (Anamudi 2,695m).
  2. Renaissance Leaders & Movements: Sree Narayana Guru (Aruvippuram 1888, Sivagiri), Ayyankali (Villuvandi Samaram 1893, Sadhujana Paripalana Sangham 1907), Chattampi Swamikal, Vakkom Moulavi, V.T. Bhattathiripad, Poykayil Yohannan, K. Kelappan, Mannathu Padmanabhan.
  3. State Symbols: Animal: Indian Elephant (Elephas maximus), Bird: Great Indian Hornbill (Buceros bicornis), Tree: Coconut Palm (Cocos nucifera), Flower: Kanikkonna (Cassia fistula), Fruit: Jackfruit (Artocarpus heterophyllus), Fish: Karimeen (Etroplus suratensis).
  4. National Parks & Sanctuaries: Silent Valley (established 1984, dedicated 1985), Eravikulam (1978), Periyar Tiger Reserve, Thattekkad Bird Sanctuary (Salim Ali).
  5. Kerala Model of Development: High PQLI/HDI comparable to developed nations, highest literacy (94%+), lowest maternal & infant mortality, sex ratio (1084 females per 1000 males in 2011 census), Kudumbashree poverty eradication mission (launched 1998 in Malappuram).
  6. Firsts in Kerala: First Chief Minister: E.M.S. Namboodiripad (1957); First Governor: B. Ramakrishna Rao; First High Court Chief Justice: K.T. Koshy; First Woman Supreme Court Judge: Justice M. Fathima Beevi; First Woman Chief Engineer: P.K. Thressia; First IT Park: Technopark (1990).`,
    tags: ['Kerala PSC', 'Syllabus', 'General Knowledge', 'KAS', 'LDC', 'GK Facts'],
    enabled: true,
    tokenEstimate: 540,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-kerala-economy-tech',
    title: 'Kerala Economy, IT Parks, Startups & Modern Infrastructure (കേരള സമ്പദ്‌വ്യവസ്ഥയും സാങ്കേതികവിദ്യയും)',
    type: 'structured',
    category: 'Kerala Economy & Tech',
    summary: 'Technopark, Infopark, Cyberpark, KSUM, Kochi Metro, Water Metro, Vizhinjam Seaport, CIAL, and green tech.',
    content: `# KERALA ECONOMY, IT HUBS & MODERN INFRASTRUCTURE (കേരള ഐ.ടിയും വികസനവും)
- Information Technology & Digital Economy:
  * Technopark (Thiruvananthapuram): India's first IT park founded in 1990 under K.P.P. Nambiar and E.K. Nayanar government. Now over 500 companies and 75,000+ engineers spanning Phase I, II, III, and Phase IV (Technocity).
  * Infopark (Kochi): Prime IT hub established in 2004 in Kakkanad with satellite campuses at Koratty (Thrissur) and Cherthala (Alappuzha). Home to global tech leaders including TCS, Cognizant, Wipro, UST, IBS Software.
  * Cyberpark (Kozhikode): Hub for Malabar region tech entrepreneurship and product startups.
  * Kerala Startup Mission (KSUM): State nodal agency for startups and incubation (Maker Village, Kochi - India's largest electronic hardware incubator).
  * Digital University Kerala (DUK): India's first digital university established at Technocity, pioneering AI, blockchain, and semiconductor research.
- Global Infrastructure Landmarks:
  * Vizhinjam International Transshipment Deepwater Seaport: Natural deep draft (18–20 meters) transshipment hub close to international east-west shipping channel, capable of berthing ultra-large container vessels (ULCVs) of 24,000+ TEU.
  * Cochin International Airport (CIAL): World's FIRST airport fully powered by solar energy (awarded UN Champions of the Earth in 2018).
  * Kochi Water Metro: World's first integrated electric-hybrid water metro passenger transport system connecting 10 islands with Kochi mainland via 78 eco-friendly catamarans.
  * Cochin Shipyard Limited (CSL): Built INS Vikrant (IAC-1) — India's first indigenously designed and constructed aircraft carrier.
- Economic Drivers:
  * Plantation Crops: Rubber (produces 75%+ of India's natural rubber), Cardamom, Black Pepper, Coconut, Tea, Coffee.
  * Marine Exports: Shrimp, squid, and cuttlefish from Kochi, Kollam, Munambam, and Beypore.
  * Tourism ('God's Own Country'): Backwaters, Ayurveda, Munnar, Wayanad, Kovalam.
  * Remittances: Strong NRI contribution to household prosperity and infrastructure.`,
    tags: ['Kerala Economy', 'Technopark', 'Infopark', 'Vizhinjam', 'Water Metro', 'Startups'],
    enabled: true,
    tokenEstimate: 510,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'kb-kerala-biodiversity-symbols',
    title: 'Kerala Biodiversity, Western Ghats, 6 National Parks & State Symbols (കേരള ജൈവവൈവിധ്യം)',
    type: 'structured',
    category: 'Kerala Biodiversity & Nature',
    summary: 'Silent Valley, Eravikulam, Periyar, Nilgiri Tahr, Lion-tailed Macaque, and official state symbols (Elephant, Hornbill, Kanikkonna, Jackfruit, Karimeen).',
    content: `# KERALA BIODIVERSITY, WILDLIFE & OFFICIAL SYMBOLS (കേരള ജൈവവൈവിധ്യം)

## 1. Western Ghats & Global Biodiversity Hotspot
- **UNESCO World Heritage**: The Western Ghats (സഹ്യാദ്രി) is one of the world's 36 global biodiversity hotspots, featuring exceptional endemism.
- **6 National Parks**:
  1. **Silent Valley National Park (Palakkad)**: Core of Nilgiri Biosphere Reserve; saved by historic "Save Silent Valley" ecological movement (1970s); home to the endangered Lion-tailed Macaque (*Macaca silenus*) and Kunthi river.
  2. **Eravikulam National Park (Idukki)**: Home to largest surviving population of Nilgiri Tahr (*Nilgiritragus hylocrius*); habitat of Neelakurinji (*Strobilanthes kunthiana*, blooms once in 12 years); surrounds Anamudi peak (2,695m).
  3. **Periyar National Park & Tiger Reserve (Thekkady, Idukki)**: Artificial Periyar lake formed by Mullaperiyar dam (1895); renowned elephant and tiger reserve.
  4. **Mathikettan Shola National Park (Idukki)**: Cardamom hill tract shola ecosystem.
  5. **Anamudi Shola National Park (Idukki)**: High-altitude montane evergreen shola forest.
  6. **Pambadum Shola National Park (Idukki)**: Smallest national park in Kerala.

## 2. Official Kerala State Symbols
- **State Animal**: Indian Elephant (*Elephas maximus* / ആന)
- **State Bird**: Great Indian Hornbill (*Buceros bicornis* / മലമുഴക്കി വേഴാമ്പൽ)
- **State Tree**: Coconut Tree (*Cocos nucifera* / തെങ്ങ്)
- **State Flower**: Kanikkonna (*Cassia fistula* / കണിക്കൊന്ന - Golden Shower)
- **State Fruit**: Jackfruit (*Artocarpus heterophyllus* / ചക്ക)
- **State Fish**: Karimeen (*Etroplus suratensis* / കരിമീൻ - Pearl Spot)
- **Official Beverage**: Tender Coconut Water (ഇളനീർ)`,
    tags: ['Kerala', 'Biodiversity', 'Silent Valley', 'National Parks', 'Elephant', 'Hornbill', 'Kanikkonna'],
    enabled: true,
    tokenEstimate: 470,
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
];
