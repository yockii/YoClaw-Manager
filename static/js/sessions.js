// 初始化会话的Agent选择
function initSessionsAgentSelect() {
    const select = $('#sessionsAgentSelect');
    select.empty();
    
    if (!currentConfig.agents) {
        select.append('<option value="">无可用Agent</option>');
        return;
    }
    
    Object.keys(currentConfig.agents).forEach(agentKey => {
        select.append(`<option value="${agentKey}">${agentKey}</option>`);
    });
}

// 加载会话
function loadSessions() {
    const agentKey = $('#sessionsAgentSelect').val();
    if (!agentKey) {
        alert('请选择一个Agent');
        return;
    }
    
    const token = new URLSearchParams(window.location.search).get('token') || 'default';
    
    $.ajax({
        url: `/api/sessions?token=${token}&agent=${agentKey}`,
        method: 'GET',
        success: function(response) {
            renderSessions(response.sessions || []);
        },
        error: function(xhr, status, error) {
            console.error('Failed to load sessions:', error);
            alert('加载会话失败');
        }
    });
}

// 渲染会话
function renderSessions(sessions) {
    const container = $('#sessionsList');
    container.empty();
    
    if (sessions.length === 0) {
        container.html('<p>暂无会话</p>');
        return;
    }
    
    sessions.forEach(session => {
        let html = `
            <div class="session-item">
                <h4>${session.chat_id}</h4>
                <div class="session-channel">通道: ${session.channel}</div>
                <div class="session-messages">
        `;
        
        if (session.messages && session.messages.length > 0) {
            session.messages.forEach(message => {
                const messageClass = message.role === 'user' ? 'user' : 'assistant';
                
                html += `
                    <div class="session-message ${messageClass}">
                        <div class="message-role">${message.role}</div>
                        <div class="message-content">${message.role === 'assistant' ? marked.parse(message.content || '') : (message.content || '')}</div>
                        <div class="message-time">${new Date(message.timestamp).toLocaleString()}</div>
                `;
                
                if (message.tool_calls && message.tool_calls.length > 0) {
                    html += `
                        <div class="tool-calls">
                            <strong>工具调用:</strong>
                    `;
                    
                    message.tool_calls.forEach(toolCall => {
                        html += `
                            <div class="tool-call">
                                <span class="tool-call-name">${toolCall.name}</span>
                                <span>参数: ${toolCall.arguments}</span>
                                ${toolCall.result ? `<span>结果: ${toolCall.result}</span>` : ''}
                            </div>
                        `;
                    });
                    
                    html += `</div>`;
                }
                
                html += `</div>`;
            });
        }
        
        html += `
                </div>
            </div>
        `;
        
        container.append(html);
    });
}