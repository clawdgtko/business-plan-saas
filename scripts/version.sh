#!/bin/bash

# Script de gestion de version SemVer
# Usage: ./scripts/version.sh [patch|minor|major|rc|release]

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Récupérer la version actuelle
get_current_version() {
    node -p "require('./package.json').version"
}

# Bump version selon le type
bump_version() {
    local type=$1
    local current=$(get_current_version)
    local major minor patch

    IFS='.' read -r major minor patch <<< "$current"

    # Gérer les prerelease (ex: 1.2.0-rc.1)
    if [[ "$patch" == *"-"* ]]; then
        local base_patch=$(echo "$patch" | cut -d'-' -f1)
        local pre=$(echo "$patch" | cut -d'-' -f2)
        local pre_type=$(echo "$pre" | cut -d'.' -f1)
        local pre_num=$(echo "$pre" | cut -d'.' -f2)

        case $type in
            rc)
                pre_num=$((pre_num + 1))
                echo "$major.$minor.$base_patch-$pre_type.$pre_num"
                ;;
            release)
                echo "$major.$minor.$base_patch"
                ;;
            *)
                echo "$major.$minor.$((base_patch + 1))"
                ;;
        esac
        return
    fi

    case $type in
        patch)
            echo "$major.$minor.$((patch + 1))"
            ;;
        minor)
            echo "$major.$((minor + 1)).0"
            ;;
        major)
            echo "$((major + 1)).0.0"
            ;;
        rc)
            echo "$major.$minor.$((patch + 1))-rc.1"
            ;;
        *)
            echo "$current"
            ;;
    esac
}

# Mettre à jour les fichiers
update_version() {
    local new_version=$1
    
    # Mettre à jour package.json
    npm version "$new_version" --no-git-tag-version
    
    # Mettre à jour CHANGELOG.md
    sed -i "s/## \[Unreleased\]/## [Unreleased]\n\n## [$new_version] - $(date +%Y-%m-%d)/" CHANGELOG.md
    
    echo -e "${GREEN}✅ Version bumpée: $new_version${NC}"
}

# Créer un git tag
create_tag() {
    local version=$1
    git add package.json package-lock.json CHANGELOG.md
    git commit -m "chore(release): v$version"
    git tag -a "v$version" -m "Release v$version"
    echo -e "${GREEN}🏷️  Tag créé: v$version${NC}"
}

# Afficher l'aide
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  patch       Bump version patch (1.2.3 → 1.2.4)"
    echo "  minor       Bump version minor (1.2.3 → 1.3.0)"
    echo "  major       Bump version major (1.2.3 → 2.0.0)"
    echo "  rc          Créer release candidate (1.2.3 → 1.2.4-rc.1)"
    echo "  release     Finaliser RC (1.2.4-rc.2 → 1.2.4)"
    echo "  current     Afficher la version courante"
    echo "  help        Afficher cette aide"
    echo ""
    echo "Options:"
    echo "  --tag       Créer le git tag après bump"
    echo ""
    echo "Exemples:"
    echo "  $0 patch --tag        # Bump patch + créer tag"
    echo "  $0 minor              # Bump minor sans tag"
    echo "  $0 rc --tag           # Créer RC et tagger"
}

# Main
main() {
    local command=$1
    local create_tag_flag=false

    # Vérifier les arguments
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi

    # Vérifier si --tag est présent
    for arg in "$@"; do
        if [ "$arg" == "--tag" ]; then
            create_tag_flag=true
        fi
    done

    # Vérifier que package.json existe
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json non trouvé${NC}"
        exit 1
    fi

    local current=$(get_current_version)

    case $command in
        current)
            echo "Version courante: $current"
            ;;
        patch|minor|major|rc|release)
            local new_version=$(bump_version "$command")
            echo -e "${YELLOW}Bumping: $current → $new_version${NC}"
            
            update_version "$new_version"
            
            if [ "$create_tag_flag" = true ]; then
                create_tag "$new_version"
                echo -e "${GREEN}🚀 Poussez avec: git push && git push --tags${NC}"
            fi
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}❌ Commande inconnue: $command${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
