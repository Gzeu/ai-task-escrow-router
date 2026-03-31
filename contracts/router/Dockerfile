FROM rustlang/rust:nightly

WORKDIR /contract

# Copy source code
COPY . .

# Check syntax only (no WASM build)
RUN cargo check

# Default command
CMD ["bash"]
