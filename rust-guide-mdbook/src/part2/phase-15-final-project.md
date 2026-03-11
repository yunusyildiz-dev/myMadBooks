# Phase 15 — Final Project: Multithreaded Web Server

**Chapter 21: Building a Multithreaded Web Server**

### Day 64 — TCP & HTTP Basics
- Open a socket: `TcpListener::bind()`
- Accept connections: `TcpStream`
- Parse HTTP requests and build HTTP responses

### Day 65 — Single-Threaded Server
- `handle_connection()` function
- Read requests with `BufReader`
- Serve HTML files with `fs::read_to_string()`

### Day 66 — Thread Pool
- Why a thread pool? The problem with naive thread spawning
- `ThreadPool::new(size)`, `Worker` and `Job` types
- Sending jobs with `mpsc::channel()`

### Day 67 — Graceful Shutdown
- Implement `Drop`: cleanly shut down threads
- Stop workers by sending `None` messages
- Wait with `thread.join()`
- **Task:** Stress test the thread pool
