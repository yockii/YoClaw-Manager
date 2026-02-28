// 初始化定时任务的Agent选择
function initCronAgentSelect() {
    const select = $('#cronAgentSelect');
    select.empty();
    
    if (!currentConfig.agents) {
        select.append('<option value="">无可用Agent</option>');
        return;
    }
    
    Object.keys(currentConfig.agents).forEach(agentKey => {
        select.append(`<option value="${agentKey}">${agentKey}</option>`);
    });
}

// 加载定时任务
function loadCronJobs() {
    const agentKey = $('#cronAgentSelect').val();
    if (!agentKey) {
        alert('请选择一个Agent');
        return;
    }
    
    const token = new URLSearchParams(window.location.search).get('token') || 'default';
    
    $.ajax({
        url: `/api/cron?token=${token}&agent=${agentKey}`,
        method: 'GET',
        success: function(response) {
            renderCronJobs(response.cronJobs || []);
        },
        error: function(xhr, status, error) {
            console.error('Failed to load cron jobs:', error);
            alert('加载定时任务失败');
        }
    });
}

// 渲染定时任务
function renderCronJobs(cronJobs) {
    const container = $('#cronList');
    container.empty();
    
    if (cronJobs.length === 0) {
        container.html('<p>暂无定时任务</p>');
        return;
    }
    
    cronJobs.forEach(job => {
        const statusClass = job.status === 'running' ? 'running' : job.status === 'paused' ? 'paused' : 'stopped';
        
        const html = `
            <div class="cron-item">
                <h4>${job.id} <span class="cron-status ${statusClass}">${job.status}</span></h4>
                <div class="cron-info">
                    <div class="cron-info-item">
                        <span class="cron-info-label">调度表达式</span>
                        <span class="cron-info-value">${job.schedule}</span>
                    </div>
                    <div class="cron-info-item">
                        <span class="cron-info-label">描述</span>
                        <span class="cron-info-value">${job.description || '无'}</span>
                    </div>
                    <div class="cron-info-item">
                        <span class="cron-info-label">通道</span>
                        <span class="cron-info-value">${job.channel || '无'}</span>
                    </div>
                    <div class="cron-info-item">
                        <span class="cron-info-label">聊天ID</span>
                        <span class="cron-info-value">${job.chat_id || '无'}</span>
                    </div>
                    <div class="cron-info-item">
                        <span class="cron-info-label">最后运行</span>
                        <span class="cron-info-value">${job.last_run ? new Date(job.last_run).toLocaleString() : '从未'}</span>
                    </div>
                    <div class="cron-info-item">
                        <span class="cron-info-label">下次运行</span>
                        <span class="cron-info-value">${job.next_run ? new Date(job.next_run).toLocaleString() : '无'}</span>
                    </div>
                    <div class="cron-info-item">
                        <span class="cron-info-label">创建时间</span>
                        <span class="cron-info-value">${new Date(job.created_at).toLocaleString()}</span>
                    </div>
                    <div class="cron-info-item">
                        <span class="cron-info-label">更新时间</span>
                        <span class="cron-info-value">${new Date(job.updated_at).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
        container.append(html);
    });
}