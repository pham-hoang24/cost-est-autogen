from __future__ import annotations
from abc import ABC, abstractmethod

class IntakeChannel(ABC):
    @abstractmethod
    def ask(self, question: str) -> str:
        ...

class CLIChannel(IntakeChannel):
    def ask(self, question: str) -> str:
        try:
            return input(f"{question} ").strip()
        except EOFError:
            print(f"\nNon-interactive mode: No input provided for question: '{question}'")
            return ""


