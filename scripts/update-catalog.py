#!/usr/bin/env python3
"""Rebuild the static portfolio catalog from public GitHub metadata or local checkouts.

Usage: python3 scripts/update-catalog.py --local-root ..
       python3 scripts/update-catalog.py --github
No tokens or private repository contents are required or collected.
"""
import argparse
import datetime
import json
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
ASSETS = SITE / 'assets'
USER = 'GabrielUnsa'
EXTENSIONS = {'.py', '.ipynb', '.c', '.h', '.cpp', '.java', '.hs', '.pl', '.pas', '.sql', '.mod', '.js', '.ts', '.tsx', '.jsx', '.html', '.css', '.sh', '.pkt', '.php', '.yml', '.yaml', '.vim'}
EXCLUDED_DIRS = {'.git', '.venv', 'venv', 'node_modules', 'dist', 'build', 'debug', '__pycache__', 'datasets', 'img', 'images', 'vendor', 'bootstrap', 'jquery'}
EXCLUDED_FILES = {'catalog.js', 'localhost.sql', 'padrones.js', 'package-lock.json'}

def load(name):
    return json.loads((ASSETS / name).read_text(encoding='utf-8'))

def public_source(path):
    parts = Path(path).parts
    lower = path.lower()
    if any(p.lower() in EXCLUDED_DIRS for p in parts):
        return False
    if Path(path).name.lower() in EXCLUDED_FILES or any(s in lower for s in ('.env', '.min.js', '.min.css', '.d.ts', 'padron', 'backup', 'jquery', 'bootstrap.min')):
        return False
    return Path(path).suffix.lower() in EXTENSIONS or path.startswith('RoutingIP/') or path == 'confrouter'

def api(path):
    request = urllib.request.Request('https://api.github.com/' + path, headers={'Accept': 'application/vnd.github+json', 'User-Agent': 'GabrielUnsa-Portfolio-Catalog'})
    with urllib.request.urlopen(request, timeout=40) as response:
        return json.load(response)

def github_repositories():
    result = []
    page = 1
    while True:
        batch = api(f'users/{USER}/repos?per_page=100&type=owner&page={page}')
        result.extend(batch)
        if len(batch) < 100:
            return result
        page += 1

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--local-root', type=Path, help='Directory containing public repository checkouts')
    group.add_argument('--github', action='store_true', help='Refresh all public repositories from the GitHub API')
    args = parser.parse_args()
    repositories = load('repositories.json')
    projects = load('projects.json')
    inventory = []
    if args.github:
        current = github_repositories()
        known = {r['name']: r for r in repositories}
        public = []
        for remote in current:
            r = known.get(remote['name'], {'name': remote['name'], 'subtitle': 'Repositorio público', 'description': remote.get('description') or 'Código y material de desarrollo.', 'tags': [remote['language']] if remote.get('language') else []})
            r.update(public=True, url=remote['html_url'], branch=remote['default_branch'])
            public.append(r)
        # Preserve only manually curated private summaries, never their file trees.
        repositories = public + [r for r in repositories if not r['public'] and r['name'] not in {p['name'] for p in public}]
    for repo in repositories:
        if not repo['public']:
            continue
        if repo['name'].lower() == f'{USER}.github.io'.lower():
            # Index the exact portfolio checkout being published, including new files.
            paths = subprocess.check_output(['git', '-C', str(SITE), 'ls-files', '--cached', '--others', '--exclude-standard', '-z']).decode('utf-8').split('\0')
            paths = [path for path in paths if (SITE / path).is_file()]
        elif args.github:
            branch = urllib.parse.quote(repo['branch'], safe='')
            tree = api(f'repos/{USER}/{repo["name"]}/git/trees/{branch}?recursive=1')
            if tree.get('truncated'):
                raise RuntimeError(f'Incomplete GitHub tree for {repo["name"]}; catalog left unchanged.')
            paths = [node['path'] for node in tree['tree'] if node['type'] == 'blob']
        else:
            directory = args.local_root.resolve() / repo['name']
            if not (directory / '.git').exists():
                raise RuntimeError(f'Missing local checkout: {directory}')
            paths = subprocess.check_output(['git', '-C', str(directory), 'ls-files', '-z']).decode('utf-8').split('\0')
        for path in paths:
            if not path or not public_source(path):
                continue
            url = f'https://github.com/{USER}/{repo["name"]}/blob/{urllib.parse.quote(repo["branch"], safe="")}/{urllib.parse.quote(path, safe="/")}'
            inventory.append({'repo': repo['name'], 'path': path, 'url': url})
    inventory.sort(key=lambda item: (item['repo'].casefold(), item['path'].casefold()))
    catalog = {'updated': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d'), 'projects': projects, 'repositories': repositories, 'files': inventory}
    # Write only after all reads/API requests succeed, avoiding a partial catalog.
    (ASSETS / 'repositories.json').write_text(json.dumps(repositories, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (ASSETS / 'source-index.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (ASSETS / 'catalog.js').write_text('// Generated by scripts/update-catalog.py; edit projects.json to curate projects.\nwindow.PORTFOLIO_DATA = ' + json.dumps(catalog, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c') + ';\n', encoding='utf-8')
    print(f'Catalog: {len(projects)} projects, {sum(r["public"] for r in repositories)} public repositories, {len(inventory)} source files.')

if __name__ == '__main__':
    main()
