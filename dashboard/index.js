// Dashboard Sprint - Business Plan SaaS
// Sert le fichier HTML statique

export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Dashboard Sprint - Business Plan SaaS</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .last-update { color: #888; font-size: 0.9rem; }
        .refresh-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 10px;
            font-size: 1rem;
        }
        .refresh-btn:hover { opacity: 0.9; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }
        .card {
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .card h2 {
            font-size: 1.2rem;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        .status-green { background: #10b981; color: #fff; }
        .status-yellow { background: #f59e0b; color: #fff; }
        .status-red { background: #ef4444; color: #fff; }
        .status-blue { background: #3b82f6; color: #fff; }
        .progress-bar {
            width: 100%;
            height: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 5px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 5px;
            transition: width 0.3s;
        }
        .item-list { list-style: none; }
        .item {
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
            border-left: 3px solid #667eea;
        }
        .item-title { font-weight: 600; margin-bottom: 5px; }
        .item-meta { font-size: 0.85rem; color: #888; }
        .agent-card {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            margin-bottom: 10px;
        }
        .agent-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        .agent-info { flex: 1; }
        .agent-name { font-weight: 600; }
        .agent-task { font-size: 0.85rem; color: #888; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        .stat-box {
            text-align: center;
            padding: 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
        }
        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #667eea;
        }
        .stat-label { font-size: 0.85rem; color: #888; }
        .loading { text-align: center; padding: 40px; color: #888; }
        .error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
            color: #ef4444;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        .github-link { color: #667eea; text-decoration: none; }
        .github-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Dashboard Sprint - Business Plan SaaS</h1>
            <p class="last-update">Dernière mise à jour: <span id="lastUpdate">-</span></p>
            <button class="refresh-btn" onclick="refreshData()">🔄 Rafraîchir</button>
        </header>
        
        <div class="grid">
            <div class="card">
                <h2>🎯 Sprint Actif</h2>
                <div id="sprintInfo"><div class="loading">Chargement...</div></div>
            </div>
            
            <div class="card">
                <h2>👥 Équipe</h2>
                <div id="teamInfo"><div class="loading">Chargement...</div></div>
            </div>
            
            <div class="card">
                <h2>📈 Statistiques</h2>
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-value" id="statIssues">-</div>
                        <div class="stat-label">Issues</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="statPRs">-</div>
                        <div class="stat-label">PRs Ouvertes</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="statCommits">-</div>
                        <div class="stat-label">Commits 24h</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h2>📋 Issues Ouvertes</h2>
                <ul class="item-list" id="issuesList"><li class="loading">Chargement...</li></ul>
            </div>
            
            <div class="card">
                <h2>🔀 Pull Requests</h2>
                <ul class="item-list" id="prsList"><li class="loading">Chargement...</li></ul>
            </div>
            
            <div class="card">
                <h2>📦 Livrables Sprint</h2>
                <ul class="item-list" id="livrablesList"><li class="loading">Chargement...</li></ul>
            </div>
        </div>
    </div>
    
    <script>
        const REPO_OWNER = 'clawdgtko';
        const REPO_NAME = 'business-plan-saas';
        const GITHUB_API = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME;
        
        const sprintData = {
            number: 1,
            name: "Fondations",
            startDate: "2026-02-16",
            endDate: "2026-02-18",
            status: "🟡 En cours",
            progress: 65,
            livrables: [
                { name: "Auth Magic Link", status: "done" },
                { name: "CRUD Business Plan", status: "done" },
                { name: "Stripe Checkout", status: "done" },
                { name: "CI/CD GitHub Actions", status: "done" },
                { name: "Tests coverage > 80%", status: "progress" },
                { name: "Documentation API", status: "progress" },
                { name: "Feature flags", status: "progress" }
            ]
        };
        
        const teamData = [
            { name: "@BackendAgent", task: "Security & Secrets (#55)", status: "🟡 En cours", emoji: "⚙️" },
            { name: "@FrontendAgent", task: "Onboarding Flow (#66)", status: "🟡 En cours", emoji: "🎨" },
            { name: "@DevOpsAgent", task: "Monitoring (#48)", status: "🟡 En cours", emoji: "🔧" },
            { name: "@QAEngineer", task: "Feature Flags (#52)", status: "🟡 En cours", emoji: "🧪" },
            { name: "@UXDesigner", task: "User Journey (#61)", status: "🟡 En cours", emoji: "✏️" },
            { name: "@ProductManager", task: "Sprint Management", status: "🟢 Actif", emoji: "📊" },
            { name: "@LeadDev", task: "Code Review & Architecture", status: "🟢 Actif", emoji: "👨‍💻" }
        ];
        
        async function fetchGitHubData() {
            try {
                const issuesResponse = await fetch(GITHUB_API + '/issues?state=open&per_page=10');
                const issues = await issuesResponse.json();
                
                const prsResponse = await fetch(GITHUB_API + '/pulls?state=open&per_page=10');
                const prs = await prsResponse.json();
                
                const date = new Date();
                date.setDate(date.getDate() - 1);
                const since = date.toISOString();
                const commitsResponse = await fetch(GITHUB_API + '/commits?since=' + since + '&per_page=100');
                const commits = await commitsResponse.json();
                
                return { issues, prs, commits };
            } catch (error) {
                console.error('Error:', error);
                return null;
            }
        }
        
        function renderSprintInfo() {
            const sprintInfo = document.getElementById('sprintInfo');
            sprintInfo.innerHTML = '<div style="margin-bottom: 15px;"><strong>Sprint #' + sprintData.number + '</strong> - ' + sprintData.name + ' <span class="status-badge status-yellow">' + sprintData.status + '</span></div><div style="margin-bottom: 10px;">📅 ' + sprintData.startDate + ' → ' + sprintData.endDate + '</div><div style="margin-bottom: 10px;">Progression: ' + sprintData.progress + '%</div><div class="progress-bar"><div class="progress-fill" style="width: ' + sprintData.progress + '%"></div></div>';
        }
        
        function renderTeamInfo() {
            const teamInfo = document.getElementById('teamInfo');
            teamInfo.innerHTML = teamData.map(agent => {
                const statusClass = agent.status.includes('En cours') ? 'status-yellow' : 'status-green';
                const statusText = agent.status.split(' ')[0];
                return '<div class="agent-card"><div class="agent-avatar">' + agent.emoji + '</div><div class="agent-info"><div class="agent-name">' + agent.name + '</div><div class="agent-task">' + agent.task + '</div></div><span class="status-badge ' + statusClass + '">' + statusText + '</span></div>';
            }).join('');
        }
        
        function renderLivrables() {
            const livrablesList = document.getElementById('livrablesList');
            livrablesList.innerHTML = sprintData.livrables.map(l => {
                const borderColor = l.status === 'done' ? '#10b981' : l.status === 'progress' ? '#f59e0b' : '#6b7280';
                const icon = l.status === 'done' ? '✅' : l.status === 'progress' ? '🔄' : '⏳';
                return '<li class="item" style="border-left-color: ' + borderColor + '"><div class="item-title">' + icon + ' ' + l.name + '</div></li>';
            }).join('');
        }
        
        async function renderGitHubData() {
            const data = await fetchGitHubData();
            
            if (!data) {
                document.getElementById('issuesList').innerHTML = '<li class="error">Erreur - API GitHub rate limit ou offline</li>';
                return;
            }
            
            document.getElementById('statIssues').textContent = Array.isArray(data.issues) ? data.issues.length : 0;
            document.getElementById('statPRs').textContent = Array.isArray(data.prs) ? data.prs.length : 0;
            document.getElementById('statCommits').textContent = Array.isArray(data.commits) ? data.commits.length : 0;
            
            const issuesList = document.getElementById('issuesList');
            if (!Array.isArray(data.issues) || data.issues.length === 0) {
                issuesList.innerHTML = '<li class="item">Aucune issue ouverte 🎉</li>';
            } else {
                issuesList.innerHTML = data.issues.slice(0, 5).map(issue => {
                    const labels = issue.labels ? issue.labels.map(l => '<span class="status-badge status-blue" style="font-size: 0.7rem; margin-right: 5px;">' + l.name + '</span>').join('') : '';
                    return '<li class="item"><div class="item-title"><a href="' + issue.html_url + '" class="github-link" target="_blank">#' + issue.number + ' ' + issue.title.substring(0, 50) + (issue.title.length > 50 ? '...' : '') + '</a></div><div class="item-meta">' + labels + ' par @' + issue.user.login + '</div></li>';
                }).join('');
            }
            
            const prsList = document.getElementById('prsList');
            if (!Array.isArray(data.prs) || data.prs.length === 0) {
                prsList.innerHTML = '<li class="item">Aucune PR ouverte ✅</li>';
            } else {
                prsList.innerHTML = data.prs.slice(0, 5).map(pr => {
                    return '<li class="item" style="border-left-color: #3b82f6;"><div class="item-title"><a href="' + pr.html_url + '" class="github-link" target="_blank">#' + pr.number + ' ' + pr.title.substring(0, 50) + (pr.title.length > 50 ? '...' : '') + '</a></div><div class="item-meta">🌿 ' + pr.head.ref + ' → ' + pr.base.ref + ' | par @' + pr.user.login + '</div></li>';
                }).join('');
            }
        }
        
        function updateTimestamp() {
            document.getElementById('lastUpdate').textContent = new Date().toLocaleString('fr-FR');
        }
        
        async function refreshData() {
            updateTimestamp();
            renderSprintInfo();
            renderTeamInfo();
            renderLivrables();
            await renderGitHubData();
        }
        
        refreshData();
        setInterval(refreshData, 120000);
    </script>
</body>
</html>`;
    
    return new Response(html, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    });
  }
};
