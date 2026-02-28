// 初始化任务的Agent选择
function initTasksAgentSelect() {
    const select = $('#tasksAgentSelect');
    select.empty();
    
    if (!currentConfig.agents) {
        select.append('<option value="">无可用Agent</option>');
        return;
    }
    
    Object.keys(currentConfig.agents).forEach(agentKey => {
        select.append(`<option value="${agentKey}">${agentKey}</option>`);
    });
}

// 加载任务
function loadTasks() {
    const agentKey = $('#tasksAgentSelect').val();
    if (!agentKey) {
        alert('请选择一个Agent');
        return;
    }
    
    const token = new URLSearchParams(window.location.search).get('token') || 'default';
    
    $.ajax({
        url: `/api/tasks?token=${token}&agent=${agentKey}`,
        method: 'GET',
        success: function(response) {
            renderTasks(response.tasks || []);
        },
        error: function(xhr, status, error) {
            console.error('Failed to load tasks:', error);
            alert('加载任务失败');
        }
    });
}

// 渲染任务
function renderTasks(tasks) {
    const container = $('#tasksList');
    container.empty();
    
    if (tasks.length === 0) {
        container.html('<p>暂无任务</p>');
        return;
    }
    
    tasks.forEach(task => {
        const statusClass = task.status || 'pending';
        
        let html = `
            <div class="task-item">
                <h4>${task.name || task.id} <span class="task-status ${statusClass}">${task.status || 'pending'}</span></h4>
                <div class="task-info">
                    <div class="task-info-item">
                        <span class="task-info-label">ID</span>
                        <span class="task-info-value">${task.id}</span>
                    </div>
                    <div class="task-info-item">
                        <span class="task-info-label">优先级</span>
                        <span class="task-info-value">${task.priority || 'normal'}</span>
                    </div>
                    <div class="task-info-item">
                        <span class="task-info-label">通道</span>
                        <span class="task-info-value">${task.channel || '无'}</span>
                    </div>
                    <div class="task-info-item">
                        <span class="task-info-label">聊天ID</span>
                        <span class="task-info-value">${task.chat_id || '无'}</span>
                    </div>
                </div>
        `;
        
        if (task.description) {
            html += `
                <div class="task-info-item" style="grid-column: 1 / -1;">
                    <span class="task-info-label">描述</span>
                    <span class="task-info-value">${task.description}</span>
                </div>
            `;
        }
        
        if (task.last_result) {
            html += `
                <div class="task-info-item" style="grid-column: 1 / -1;">
                    <span class="task-info-label">最后结果</span>
                    <span class="task-info-value">${task.last_result}</span>
                </div>
            `;
        }
        
        if (task.history && task.history.length > 0) {
            html += `
                <div class="task-history">
                    <h5>执行历史</h5>
            `;
            
            task.history.forEach(item => {
                html += `
                    <div class="task-history-item">
                        <div class="history-role">${item.role}</div>
                        <div class="history-content">${item.role === 'assistant' ? marked.parse(item.content || '') : (item.content || '')}</div>
                        <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        html += `</div>`;
        container.append(html);
    });
}