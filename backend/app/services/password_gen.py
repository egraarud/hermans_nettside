import random
import secrets
from pathlib import Path

_WORDLIST_PATH = Path(__file__).parent.parent / "data" / "norwegian_words.txt"

_words: list[str] = []


def _load_words() -> list[str]:
    global _words
    if not _words:
        _words = [w.strip() for w in _WORDLIST_PATH.read_text(encoding="utf-8").splitlines() if w.strip()]
    return _words


def generate_passphrase(n_words: int = 3) -> str:
    words = _load_words()
    chosen = [secrets.choice(words) for _ in range(n_words)]
    return "-".join(chosen)
