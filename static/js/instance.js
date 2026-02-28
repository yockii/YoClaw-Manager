let instanceStatusInterval = null;

function loadInstanceStatus() {
    const token = new URLSearchParams(window.location.search).get('token') || 'default';
    if (!token) {
        showAuthError();
        return;
    }

    fetch(`/api/instance?token=${encodeURIComponent(token)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load instance status');
            }
            return response.json();
        })
        .then(data => {
            updateInstanceUI(data.status);
        })
        .catch(error => {
            console.error('Error loading instance status:', error);
            document.getElementById('instanceStatusText').textContent = '加载失败';
        });
}

function updateInstanceUI(status) {
    const statusIndicator = document.getElementById('instanceStatus');
    const statusText = document.getElementById('instanceStatusText');
    const instanceInfo = document.getElementById('instanceInfo');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const restartBtn = document.getElementById('restartBtn');

    if (status.running) {
        statusIndicator.className = 'status-indicator connected';
        statusText.textContent = '运行中';
        startBtn.disabled = true;
        stopBtn.disabled = false;
        restartBtn.disabled = false;
    } else {
        statusIndicator.className = 'status-indicator disconnected';
        statusText.textContent = '已停止';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        restartBtn.disabled = true;
    }

    let infoHTML = '';
    infoHTML += `<div class="instance-info-item">
        <span class="instance-info-label">可执行文件</span>
        <span class="instance-info-value">${status.executable || '未找到'}</span>
    </div>`;
    
    infoHTML += `<div class="instance-info-item">
        <span class="instance-info-label">配置文件</span>
        <span class="instance-info-value">${status.config_path || '未设置'}</span>
    </div>`;
    
    infoHTML += `<div class="instance-info-item">
        <span class="instance-info-label">状态</span>
        <span class="instance-info-value ${status.running ? 'running' : 'stopped'}">${status.running ? '运行中' : '已停止'}</span>
    </div>`;
    
    if (status.running && status.pid) {
        infoHTML += `<div class="instance-info-item">
            <span class="instance-info-label">进程 ID</span>
            <span class="instance-info-value">${status.pid}</span>
        </div>`;
    }
    
    if (status.running && status.uptime) {
        infoHTML += `<div class="instance-info-item">
            <span class="instance-info-label">运行时间</span>
            <span class="instance-info-value">${status.uptime}</span>
        </div>`;
    }
    
    if (status.auto_started) {
        infoHTML += `<div class="instance-info-item">
            <span class="instance-info-label">启动方式</span>
            <span class="instance-info-value">自动启动</span>
        </div>`;
    }

    instanceInfo.innerHTML = infoHTML;
}

function startInstance() {
    const token = new URLSearchParams(window.location.search).get('token') || 'default';
    if (!token) {
        showAuthError();
        return;
    }

    if (!confirm('确定要启动 YoClaw 实例吗？')) {
        return;
    }

    document.getElementById('startBtn').disabled = true;
    document.getElementById('startBtn').textContent = '启动中...';

    fetch(`/api/instance?action=start&token=${encodeURIComponent(token)}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to start instance');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || '实例启动成功');
        loadInstanceStatus();
    })
    .catch(error => {
        console.error('Error starting instance:', error);
        alert('启动实例失败: ' + error.message);
        document.getElementById('startBtn').disabled = false;
        document.getElementById('startBtn').textContent = '启动';
    });
}

function stopInstance() {
    const token = new URLSearchParams(window.location.search).get('token') || 'default';
    if (!token) {
        showAuthError();
        return;
    }

    if (!confirm('确定要停止 YoClaw 实例吗？')) {
        return;
    }

    document.getElementById('stopBtn').disabled = true;
    document.getElementById('stopBtn').textContent = '停止中...';

    fetch(`/api/instance?action=stop&token=${encodeURIComponent(token)}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to stop instance');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || '实例停止成功');
        loadInstanceStatus();
    })
    .catch(error => {
        console.error('Error stopping instance:', error);
        alert('停止实例失败: ' + error.message);
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('stopBtn').textContent = '停止';
    });
}

function restartInstance() {
    const token = new URLSearchParams(window.location.search).get('token') || 'default';
    if (!token) {
        showAuthError();
        return;
    }

    if (!confirm('确定要重启 YoClaw 实例吗？')) {
        return;
    }

    document.getElementById('restartBtn').disabled = true;
    document.getElementById('restartBtn').textContent = '重启中...';

    fetch(`/api/instance?action=restart&token=${encodeURIComponent(token)}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to restart instance');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || '实例重启成功');
        loadInstanceStatus();
    })
    .catch(error => {
        console.error('Error restarting instance:', error);
        alert('重启实例失败: ' + error.message);
        document.getElementById('restartBtn').disabled = false;
        document.getElementById('restartBtn').textContent = '重启';
    });
}

function startInstanceStatusPolling() {
    loadInstanceStatus();
    if (instanceStatusInterval) {
        clearInterval(instanceStatusInterval);
    }
    instanceStatusInterval = setInterval(() => {
        loadInstanceStatus();
    }, 5000);
}

function stopInstanceStatusPolling() {
    if (instanceStatusInterval) {
        clearInterval(instanceStatusInterval);
        instanceStatusInterval = null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.nav button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            if (tab === 'instance') {
                startInstanceStatusPolling();
            } else {
                stopInstanceStatusPolling();
            }
        });
    });
});
