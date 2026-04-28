# Smart College Platform - Theoretical Documentation (Part 2)

## Chapter 2: THEORETICAL STUDY

### 2.1 MERN Stack Architecture

The MERN stack represents a modern approach to full-stack web development, using JavaScript throughout the entire application stack. MERN stands for MongoDB, Express.js, React, and Node.js.

#### Why MERN Stack?

**JavaScript Everywhere**: Single language for both frontend and backend reduces context switching and improves developer productivity.

**JSON Data Flow**: Seamless data flow from database through backend to frontend.

**Rich Ecosystem**: Extensive npm package ecosystem provides solutions for common problems.

**Scalability**: Each component can scale independently based on application needs.

**Community Support**: Large developer community ensures abundant resources and solutions.

### 2.2 MongoDB - NoSQL Database

MongoDB represents a paradigm shift from traditional relational databases, offering flexibility and scalability.

#### Document-Oriented Storage

MongoDB stores data in flexible, JSON-like documents. Each document is self-contained and can have different fields from other documents in the same collection.

#### Key Features

**Schema Flexibility**: Documents can have different structures, allowing for evolving data models.

**Embedded Documents**: Related data can be stored together, reducing the need for joins.

**Indexing**: Supports various index types for query optimization.

**Aggregation Pipeline**: Powerful data processing framework for complex queries.

**Horizontal Scalability**: Sharding enables distribution of data across multiple servers.

#### When to Use MongoDB

MongoDB excels with flexible schema requirements, rapid application development, hierarchical data structures, high write throughput needs, and document-centric data models.

### 2.3 Express.js - Web Application Framework

Express.js is a minimal and flexible web application framework for Node.js.

#### Middleware Architecture

The core concept is middleware - functions that have access to request, response, and next function. Middleware can execute code, modify objects, end cycles, or call next middleware.

#### Key Concepts

**Routing**: Maps HTTP methods and URLs to handler functions.

**Middleware**: Functions applied globally or selectively to routes.

**Error Handling**: Centralized error handling with special middleware.

**Static File Serving**: Serves uploaded files and assets directly.

### 2.4 React - Frontend Library

React revolutionized frontend development through component-based architecture and efficient rendering.

#### Component-Based Architecture

React applications are built from reusable components, each encapsulating structure, styling, and behavior.

#### Key Concepts

**Virtual DOM**: Lightweight representation enabling efficient updates.

**JSX**: HTML-like syntax within JavaScript for intuitive component structure.

**State Management**: useState hook for reactive state updates.

**Effects**: useEffect hook for side effects and lifecycle events.

**Context API**: Global state sharing without prop drilling.

### 2.5 Node.js - JavaScript Runtime

Node.js enables JavaScript to run outside the browser, bringing JavaScript to server-side development.

#### Event-Driven, Non-Blocking I/O

Node.js uses an event loop for handling concurrent operations without thread management complexity.

#### Key Features

**Asynchronous Programming**: Non-blocking operations using callbacks, promises, and async/await.

**npm Ecosystem**: World's largest software registry with 2+ million packages.

**Single-Threaded**: Event loop for concurrency without thread complexity.

**V8 Engine**: Google's high-performance JavaScript engine.

### 2.6 Authentication and Security

#### JSON Web Tokens (JWT)

JWT provides stateless authentication suitable for distributed systems. A JWT contains three parts: header (algorithm and type), payload (claims/user data), and signature (verification hash).

**JWT Workflow**: User logs in → Server verifies → Server generates JWT → Client stores JWT → Client sends JWT in requests → Server verifies JWT → Server processes request.

**Advantages**: Stateless, scalable, self-contained, cross-domain support.

**Security Considerations**: Store secret securely, use HTTPS, set expiration times, implement refresh tokens, never store sensitive data in payload.

#### Password Hashing with bcrypt

bcrypt is a password hashing function designed to be computationally expensive to resist brute-force attacks.

**Key Features**: Salt (random data added to password), cost factor (number of hashing rounds), adaptive (cost can increase as hardware improves).

**Hashing Process**: User provides password → Generate salt → Combine password + salt → Apply bcrypt → Store hash.

**Verification Process**: User provides password → Retrieve stored hash → Extract salt → Hash provided password → Compare hashes.

#### Role-Based Access Control (RBAC)

RBAC restricts system access based on user roles, implementing the principle of least privilege.

**Three-Role System**:
- **Student**: View events, register, upload/download notes, create forum posts, search papers
- **Club Admin**: All student permissions + create events, view attendees, delete own events
- **Professor**: All student permissions + approve/reject events, moderate forum, view branch events

**Implementation Levels**: Route-level middleware checks, resource-level ownership verification.

### 2.7 Large Language Models (LLMs)

LLMs are neural networks trained on vast amounts of text data to understand and generate human-like text.

#### What are LLMs?

LLMs contain billions of parameters trained on diverse text from internet, books, and articles. They can perform text generation, summarization, translation, question-answering, and code writing.

#### Transformer Architecture

The key innovation is self-attention mechanism, allowing the model to weigh importance of different words when processing each word. This enables understanding of long-range dependencies and context.

#### Text Generation Process

**Tokenization**: Convert input text to tokens (subword units).

**Embedding**: Map tokens to high-dimensional vectors.

**Attention**: Calculate relationships between tokens.

**Prediction**: Generate probability distribution for next token.

**Sampling**: Select next token based on probabilities.

**Iteration**: Repeat until completion or max length.

### 2.8 Prompt Engineering

Prompt engineering is the practice of designing input prompts to elicit desired outputs from LLMs.

#### Effective Prompt Components

**Role Definition**: Sets context for model's behavior (e.g., "You are an expert academic researcher").

**Context**: Provides relevant background information.

**Task Description**: Clearly explains what's needed.

**Format Specification**: Defines output structure.

**Examples**: Demonstrates desired output format.

**Constraints**: Specifies limitations or requirements.

#### Best Practices

Be specific and explicit, use clear language, provide examples when possible, iterate and refine based on outputs, test with various inputs, consider edge cases.

### 2.9 Temperature and Token Parameters

#### Temperature (0.0 - 2.0)

Controls randomness in output generation:
- **Low (0.0-0.3)**: Deterministic, focused, factual
- **Medium (0.4-0.7)**: Balanced creativity and consistency
- **High (0.8-2.0)**: Creative, diverse, unpredictable

**Our Choice: 0.6** - Balanced for academic summaries with consistent structure and natural language variation.

#### Max Tokens

Maximum number of tokens in generated output. Token ≈ 0.75 words (English).

**Our Setting: 1800 tokens** ≈ 1350 words - Sufficient for comprehensive 7-section summary, prevents truncation, controls generation cost.

### 2.10 RESTful API Principles

REST is an architectural style for designing networked applications.

#### Core Principles

**Client-Server Separation**: Independent evolution of client and server.

**Statelessness**: Each request contains all necessary information.

**Cacheability**: Responses explicitly indicate cacheability.

**Uniform Interface**: Consistent resource identification and manipulation.

#### HTTP Methods

**GET**: Retrieve resource (idempotent, safe, cacheable).

**POST**: Create resource (not idempotent).

**PUT**: Update/replace resource (idempotent).

**PATCH**: Partial update.

**DELETE**: Remove resource (idempotent).

#### Resource Naming

Use nouns not verbs, plural for collections, nested for relationships, query parameters for filtering.

#### Status Codes

**2xx Success**: 200 OK, 201 Created, 204 No Content.

**4xx Client Error**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found.

**5xx Server Error**: 500 Internal Server Error, 503 Service Unavailable.

### 2.11 arXiv API

arXiv is a free distribution service and open-access archive for scholarly articles, hosting over 2 million papers.

#### API Structure

**Endpoint**: http://export.arxiv.org/api/query

**Query Parameters**: search_query, start, max_results, sortBy, sortOrder.

**Response Format**: Atom XML format containing entry elements with id, title, summary, author, published, and link fields.

#### Integration Challenges

**XML Parsing**: Requires xml2js library for JavaScript object conversion.

**Inconsistent Structure**: Single entry returns object, multiple return array.

**PDF Link Extraction**: Multiple link elements require filtering.

**Rate Limiting**: 1 request per 3 seconds recommended.

### 2.12 Groq and Gemini APIs

#### Groq API

Groq provides ultra-fast LLM inference using custom LPU hardware.

**Key Features**: Llama 3.3 70B model, 10-100x faster inference, OpenAI-compatible interface, competitive pricing.

#### Google Gemini API

Google's multimodal AI model with strong reasoning capabilities.

**Key Features**: Gemini 2.0 Flash model, multimodal support, optimized for low latency, reliable performance.

#### Dual-Provider Strategy

**Primary**: Try Groq first (faster, cheaper).

**Fallback**: Use Gemini if Groq fails.

**Transparency**: Return provider name to user.

**Resilience**: Ensures 99.9%+ uptime.

### 2.13 File Handling Concepts

#### Upload Process

File uploads use multipart form data encoding. Middleware like Multer handles parsing, validation, and storage.

**Flow**: Client sends multipart request → Middleware parses → Validates file → Saves to disk → Stores path in database.

#### Security Considerations

**File Type Validation**: Prevents dangerous content uploads.

**File Size Limits**: Prevents denial of service attacks.

**Unique Filenames**: Prevents conflicts and overwrites.

**Access Control**: Enforces authorization for file access.

**Malware Scanning**: Protects against malicious content.

#### Static File Serving

Web server directly serves files without application logic for better efficiency. Caching headers optimize performance.

### 2.14 Database Design Concepts

#### Schema Design Patterns

**Embedding**: Store related data in same document (use when data accessed together, one-to-few relationships).

**Referencing**: Store related data in separate documents (use when data accessed independently, one-to-many relationships).

**Our Design Choices**: Embedded attendees in events, referenced creators, embedded forum comments, referenced note uploaders.

#### Indexing Strategies

**Index Types**: Single field, compound, unique, text search.

**Selection Criteria**: Index fields used in queries, consider query frequency, balance read vs write performance, monitor index usage.
