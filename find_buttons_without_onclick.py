#!/usr/bin/env python3
import os
import re
import glob

def find_buttons_without_onclick():
    # Chercher tous les fichiers .tsx dans src/
    tsx_files = glob.glob('src/**/*.tsx', recursive=True)
    
    results = []
    
    for file_path in tsx_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for i, line in enumerate(lines):
            line_num = i + 1
            # Chercher les balises button
            if '<button' in line:
                # Vérifier si onClick est présent dans cette ligne ou les suivantes
                has_onclick = False
                
                # Chercher onClick dans la ligne courante
                if 'onClick' in line:
                    has_onclick = True
                else:
                    # Chercher dans les 5 lignes suivantes pour capturer les attributs multi-lignes
                    for j in range(1, min(6, len(lines) - i)):
                        next_line = lines[i + j]
                        if 'onClick' in next_line:
                            has_onclick = True
                            break
                        # Si on trouve la fermeture du tag, on arrête
                        if '>' in next_line and not next_line.strip().endswith('>'):
                            break
                
                if not has_onclick:
                    # Extraire le contenu du bouton pour analyse
                    button_content = line.strip()
                    
                    # Chercher le contenu complet du bouton
                    full_button = line
                    for j in range(1, min(10, len(lines) - i)):
                        if i + j < len(lines):
                            full_button += lines[i + j]
                            if '</button>' in lines[i + j]:
                                break
                    
                    # Vérifier si c'est dans un commentaire
                    is_commented = False
                    # Chercher dans les lignes précédentes pour détecter un commentaire
                    for k in range(max(0, i-10), i):
                        if '/*' in lines[k] and '*/' not in lines[k]:
                            # Début de commentaire, chercher la fin
                            for m in range(k+1, min(len(lines), i+10)):
                                if '*/' in lines[m]:
                                    if m > i:  # Le bouton est dans le commentaire
                                        is_commented = True
                                    break
                    
                    results.append({
                        'file': file_path,
                        'line': line_num,
                        'content': button_content,
                        'is_commented': is_commented,
                        'full_context': full_button[:200] + '...' if len(full_button) > 200 else full_button
                    })
    
    return results

def categorize_buttons(buttons):
    categories = {
        'commented': [],
        'social_share': [],
        'placeholders': [],
        'modals': [],
        'icons_only': [],
        'other': []
    }
    
    for button in buttons:
        content_lower = button['content'].lower()
        full_context = button['full_context'].lower()
        
        if button['is_commented']:
            categories['commented'].append(button)
        elif any(term in content_lower or term in full_context for term in ['partager', 'share', 'facebook', 'twitter', 'instagram', 'linkedin']):
            categories['social_share'].append(button)
        elif any(term in content_lower or term in full_context for term in ['placeholder', 'todo', 'coming soon', 'bientôt', 'voir plus']):
            categories['placeholders'].append(button)
        elif 'modal' in content_lower or 'modal' in full_context:
            categories['modals'].append(button)
        elif 'classname="p-2' in content_lower and not any(text in full_context for text in ['<span', 'text', 'button>']):
            categories['icons_only'].append(button)
        else:
            categories['other'].append(button)
    
    return categories

if __name__ == "__main__":
    print("🔍 Recherche des boutons sans onClick dans src/...")
    buttons = find_buttons_without_onclick()
    
    print(f"\n📊 Trouvé {len(buttons)} boutons sans onClick")
    
    categories = categorize_buttons(buttons)
    
    for category_name, category_buttons in categories.items():
        if category_buttons:
            print(f"\n🏷️  {category_name.upper()} ({len(category_buttons)} boutons):")
            print("-" * 60)
            for button in category_buttons:
                print(f"📁 {button['file']}:{button['line']}")
                print(f"   {button['content']}")
                if button['is_commented']:
                    print("   ⚠️  BOUTON COMMENTÉ")
                print()