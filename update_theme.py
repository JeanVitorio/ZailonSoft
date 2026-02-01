#!/usr/bin/env python3
"""
Script para atualizar todas as páginas com novo tema Notion
Substitui cores amber/emerald por blue/purple Notion colors
"""

import os
import re
from pathlib import Path

# Diretório do projeto
PROJECT_ROOT = Path(__file__).parent / "src"

# Padrões de substituição de cores
REPLACEMENTS = [
    # Amber -> Blue-600 (primary)
    ("amber-500", "blue-600"),
    ("amber-400", "blue-500"),
    ("amber-600", "blue-700"),
    ("from-amber-500", "from-blue-600"),
    ("to-amber-500", "to-blue-600"),
    ("via-amber-500", "via-blue-600"),
    ("via-amber-400", "via-purple-600"),
    
    # Emerald -> Blue/Purple (accent)
    ("emerald-500", "blue-600"),
    ("emerald-400", "blue-500"),
    ("emerald-600", "purple-600"),
    ("from-emerald-500", "from-blue-600"),
    ("to-emerald-500", "to-purple-600"),
    ("via-emerald-500", "via-purple-600"),
    
    # Emerald accents specific
    ("border-emerald-400", "border-blue-500"),
    ("border-emerald-500", "border-blue-600"),
    ("text-emerald-400", "text-blue-400"),
    ("text-emerald-500", "text-blue-500"),
    ("hover:border-emerald", "hover:border-blue"),
    ("ring-emerald-500", "ring-blue-600"),
    ("shadow-emerald", "shadow-blue"),
    
    # Ring colors
    ("focus:ring-amber-500", "focus:ring-blue-600"),
    ("focus:ring-emerald-500", "focus:ring-blue-600"),
    ("focus:outline-none focus:ring-1", "focus:outline-none focus:ring-1"),
]

def update_file(filepath):
    """Update a single file with new theme colors"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        for old, new in REPLACEMENTS:
            # Case-insensitive replacements
            content = re.sub(
                rf'\b{re.escape(old)}\b',
                new,
                content,
                flags=re.IGNORECASE
            )
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error updating {filepath}: {e}")
        return False

def main():
    """Update all TSX and CSS files"""
    extensions = ['.tsx', '.ts', '.css']
    updated_count = 0
    
    for ext in extensions:
        pattern = f"**/*{ext}"
        for filepath in PROJECT_ROOT.glob(pattern):
            # Skip node_modules
            if 'node_modules' in str(filepath):
                continue
            
            if update_file(filepath):
                updated_count += 1
                print(f"✓ Updated: {filepath.relative_to(PROJECT_ROOT)}")
    
    print(f"\n✅ Total files updated: {updated_count}")

if __name__ == "__main__":
    main()
