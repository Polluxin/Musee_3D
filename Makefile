.SUFFIXES:
MAKEFLAGS+=--no-builtin-rules

all: dist/main.js

dist/main.js: src/index.js
	webpack --mode production
	@touch "$@"

