// 确保在 DOM 加载完毕后执行脚本
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM 元素获取 ---
    const apiKeyBtn = document.getElementById('apiKeyBtn');
    const apiKeyBtnText = document.getElementById('apiKeyBtnText');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const closeApiKeyModal = document.getElementById('closeApiKeyModal');
    const cancelApiKey = document.getElementById('cancelApiKey');
    const saveApiKey = document.getElementById('saveApiKey');
    const toggleApiKeyVisibilityBtn = document.getElementById('toggleApiKeyVisibility');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyeOffIcon = document.getElementById('eyeOffIcon');
    const newExamBtn = document.getElementById('newExamBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const recoverDataBtn = document.getElementById('recoverDataBtn');
    const historyList = document.getElementById('historyList');
    
    const setupView = document.getElementById('setup-view');
    const examView = document.getElementById('exam-view');
    const resultView = document.getElementById('result-view');
    
    const topicsTreeContainer = document.getElementById('topicsTree');
    const customTopicInput = document.getElementById('customTopic');
    const addCustomTopicBtn = document.getElementById('addCustomTopicBtn');
    const customTopicsList = document.getElementById('customTopicsList');
    const sourceModelRadio = document.getElementById('sourceModel');
    const sourceCustomRadio = document.getElementById('sourceCustom');
    const sourcePasteRadio = document.getElementById('sourcePaste');
    const customDatabaseContainer = document.getElementById('customDatabaseContainer');
    const pasteContentContainer = document.getElementById('pasteContentContainer');
    const pasteContentArea = document.getElementById('pasteContentArea');
    const previewContainer = document.getElementById('previewContainer');
    const previewContent = document.getElementById('previewContent');
    const editPreviewBtn = document.getElementById('editPreviewBtn');
    const reUploadBtn = document.getElementById('reUploadBtn');
    const editPreviewArea = document.getElementById('editPreviewArea');
    const editContentArea = document.getElementById('editContentArea');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const customDatabaseFile = document.getElementById('customDatabaseFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const numQuestionsInput = document.getElementById('numQuestions');
    const numQuestionsLabel = document.getElementById('numQuestionsLabel');
    const examDifficultyInput = document.getElementById('examDifficulty');
    const difficultyLabel = document.getElementById('difficultyLabel');
    const difficultyDescription = document.getElementById('difficultyDescription');
    const difficultyHint = document.getElementById('difficultyHint');
    const generateExamBtn = document.getElementById('generateExamBtn');
    
    const loadingIndicator = document.getElementById('loading-indicator');
    const loadingMessage = document.getElementById('loading-message');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const examContent = document.getElementById('exam-content');
    const examTitle = document.getElementById('exam-title');
    const questionsContainer = document.getElementById('questions-container');
    const submitExamBtn = document.getElementById('submitExamBtn');
    
    const resultContent = document.getElementById('result-content');
    const resultTitle = document.getElementById('result-title');
    const resultScore = document.getElementById('result-score');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const resultQuestionsContainer = document.getElementById('result-questions-container');
    
    // 实时遮罩层相关元素
    const realtimeOverlay = document.getElementById('realtime-overlay');
    const overlayProgressBar = document.getElementById('overlay-progress-bar');
    const overlayProgressText = document.getElementById('overlay-progress-text');
    const realtimeQuestionsContainer = document.getElementById('realtime-questions-container');
    const generationLog = document.getElementById('generation-log');
    const toggleLogBtn = document.getElementById('toggle-log');
    const generationStatus = document.getElementById('generation-status');
    const completionActions = document.getElementById('completion-actions');
    const confirmStartExamBtn = document.getElementById('confirm-start-exam');
    const countdownTimer = document.getElementById('countdown-timer');

    // 移动端侧边栏相关元素
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const menuIcon = document.getElementById('menuIcon');
    const closeIcon = document.getElementById('closeIcon');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    // --- 全局状态和数据 ---

    // 从本地存储获取API Key
    let apiKey = localStorage.getItem('deepseek_api_key') || '';
    
    // 更新API Key状态显示
    function updateApiKeyStatus() {
        // 确保DOM元素存在
        if (!apiKeyStatus || !apiKeyBtnText) {
            console.warn('API Key相关DOM元素未找到，跳过状态更新');
            return;
        }
        
        if (apiKey && apiKey.trim().length > 0) {
            const maskedKey = apiKey.length > 12 ? 
                apiKey.substring(0, 8) + '***' + apiKey.substring(apiKey.length - 4) : 
                apiKey.substring(0, 4) + '***';
            apiKeyStatus.textContent = maskedKey;
            apiKeyStatus.classList.remove('text-gray-500');
            apiKeyStatus.classList.add('text-green-600');
            apiKeyBtnText.textContent = '重新设置';
        } else {
            apiKeyStatus.textContent = '未设置';
            apiKeyStatus.classList.remove('text-green-600');
            apiKeyStatus.classList.add('text-gray-500');
            apiKeyBtnText.textContent = '设置 API Key';
        }
    }

    // 安全地读取考试历史记录
    let examHistory = [];
    try {
        const historyData = localStorage.getItem('exam_history');
        if (historyData) {
            examHistory = JSON.parse(historyData);
            
            // 兼容性处理：为旧数据添加status字段
            let needUpdate = false;
            examHistory = examHistory.map(exam => {
                if (!exam.status) {
                    exam.status = 'completed'; // 旧数据默认为已完成
                    needUpdate = true;
                }
                return exam;
            });
            
            // 如果有更新，保存到localStorage
            if (needUpdate) {
                localStorage.setItem('exam_history', JSON.stringify(examHistory));
                console.log('已为', examHistory.length, '条旧记录添加状态字段');
            }
            
            console.log('成功读取考试历史记录:', examHistory.length, '条记录');
        } else {
            console.log('未找到考试历史记录');
        }
    } catch (error) {
        console.error('读取考试历史记录失败:', error);
        examHistory = [];
    }
    let currentExam = null; // 用于存储当前正在进行的考试
    let customTopics = []; // 存储用户自定义的知识点
    let customDatabaseContent = null; // 存储自定义题库内容
    let pasteContent = null; // 存储粘贴的题库内容
    let currentPreviewContent = null; // 存储预览的内容
    let originalPreviewContent = null; // 存储编辑前的预览内容
    let isSidebarOpen = false; // 侧边栏状态

    // 知识点范畴定义
    const topics = [
        {
            name: 'Java',
            children: [
                { name: 'Java 基础' },
                { name: 'Java 并发编程' },
                { name: 'JVM' },
                { name: 'Java 8+' },
            ]
        },
        {
            name: '数据库',
            children: [
                { name: 'MySQL' },
                { name: 'Redis' },
                { name: 'MySQL 调优' },
            ]
        },
        {
            name: '框架',
            children: [
                { name: 'Spring' },
                { name: 'SpringBoot' },
                { name: 'MyBatis' },
                { name: 'SpringCloud' },
            ]
        },
        {
            name: '中间件',
            children: [
                { name: 'Kafka' },
                { name: 'RabbitMQ' },
                { name: 'Nacos' },
                { name: 'Zookeeper' },
            ]
        },
        {
            name: '网络与服务器',
            children: [
                { name: 'Netty' },
                { name: 'Tomcat' },
                { name: 'HTTP' },
                { name: 'TCP/IP' },
            ]
        },
        {
            name: '其他技术',
            children: [
                { name: 'Docker' },
                { name: 'Linux' },
                { name: 'Git' },
                { name: '设计模式' },
            ]
        }
    ];

    // --- 函数定义 ---

    /**
     * 调试和数据恢复函数
     */
    function debugDataStatus() {
        console.log('=== 数据状态调试信息 ===');
        console.log('当前API Key:', apiKey ? '已设置 (长度: ' + apiKey.length + ')' : '未设置');
        console.log('考试历史记录数量:', examHistory.length);
        
        // 检查localStorage原始数据
        const rawApiKey = localStorage.getItem('deepseek_api_key');
        const rawHistory = localStorage.getItem('exam_history');
        
        console.log('localStorage中的API Key:', rawApiKey ? '存在 (长度: ' + rawApiKey.length + ')' : '不存在');
        console.log('localStorage中的历史记录:', rawHistory ? '存在 (长度: ' + rawHistory.length + ')' : '不存在');
        
        if (rawHistory) {
            try {
                const parsedHistory = JSON.parse(rawHistory);
                console.log('解析后的历史记录数量:', parsedHistory.length);
            } catch (e) {
                console.error('历史记录解析失败:', e);
            }
        }
        
        // 尝试恢复数据
        if (rawApiKey && !apiKey) {
            console.log('尝试恢复API Key...');
            apiKey = rawApiKey;
            updateApiKeyStatus();
        }
        
        if (rawHistory && examHistory.length === 0) {
            console.log('尝试恢复考试历史记录...');
            try {
                examHistory = JSON.parse(rawHistory);
                renderHistoryList();
                console.log('历史记录恢复成功');
            } catch (e) {
                console.error('历史记录恢复失败:', e);
            }
        }
        
        console.log('=== 调试信息结束 ===');
    }

    /**
     * 显示API Key设置弹窗
     */
    function showApiKeyModal() {
        apiKeyInput.value = apiKey; // 设置当前API Key值
        apiKeyModal.classList.remove('hidden');
        apiKeyInput.focus();
    }

    /**
     * 隐藏API Key设置弹窗
     */
    function hideApiKeyModal() {
        apiKeyModal.classList.add('hidden');
        apiKeyInput.value = ''; // 清空输入框
        // 重置密码可见性
        apiKeyInput.type = 'password';
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
    }

    /**
     * 保存API Key配置
     */
    function saveApiKeyConfig() {
        const newApiKey = apiKeyInput.value.trim();
        
        if (newApiKey.length === 0) {
            alert('请输入有效的API Key');
            return;
        }
        
        // 简单验证API Key格式（DeepSeek API Key通常以sk-开头）
        if (!newApiKey.startsWith('sk-')) {
            const confirm = window.confirm('API Key格式可能不正确（通常以sk-开头）。是否仍要保存？');
            if (!confirm) {
                return;
            }
        }
        
        apiKey = newApiKey;
        localStorage.setItem('deepseek_api_key', apiKey);
        updateApiKeyStatus();
        hideApiKeyModal();
        
        // 显示成功提示
        showTemporaryMessage('API Key 配置已保存', 'success');
    }

    /**
     * 切换API Key输入框的可见性
     */
    function toggleApiKeyVisibility() {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            eyeIcon.classList.add('hidden');
            eyeOffIcon.classList.remove('hidden');
        } else {
            apiKeyInput.type = 'password';
            eyeIcon.classList.remove('hidden');
            eyeOffIcon.classList.add('hidden');
        }
    }

    /**
     * 显示临时消息提示
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 ('success', 'error', 'warning')
     */
    function showTemporaryMessage(message, type = 'success') {
        const messageEl = document.createElement('div');
        messageEl.className = `temporary-message fixed top-4 right-4 z-60 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
        
        // 根据类型设置颜色
        if (type === 'success') {
            messageEl.classList.add('bg-green-500');
        } else if (type === 'error') {
            messageEl.classList.add('bg-red-500');
        } else if (type === 'warning') {
            messageEl.classList.add('bg-orange-500');
        }
        
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        // 显示动画
        setTimeout(() => {
            messageEl.classList.remove('translate-x-full');
        }, 100);
        
        // 3秒后隐藏
        setTimeout(() => {
            messageEl.classList.add('translate-x-full');
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 切换主内容区的视图
     * @param {string} viewName - 要显示的视图名称 ('setup', 'exam', 'result')
     */
    function switchView(viewName) {
        setupView.classList.add('hidden');
        examView.classList.add('hidden');
        resultView.classList.add('hidden');

        if (viewName === 'setup') {
            setupView.classList.remove('hidden');
        } else if (viewName === 'exam') {
            examView.classList.remove('hidden');
        } else if (viewName === 'result') {
            resultView.classList.remove('hidden');
        }
    }

    /**
     * 渲染知识点选择树
     */
    function renderTopicsTree() {
        topicsTreeContainer.innerHTML = '';
        topics.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('mb-2');
            
            const parentCheckboxId = `topic-${category.name.replace(/\s+/g, '-')}`;
            categoryDiv.innerHTML = `
                <div class="font-bold">
                    <input type="checkbox" id="${parentCheckboxId}" data-category="${category.name}" class="parent-topic">
                    <label for="${parentCheckboxId}">${category.name}</label>
                </div>
            `;
            
            const childrenDiv = document.createElement('div');
            childrenDiv.classList.add('ml-4', 'mt-1');
            
            category.children.forEach(topic => {
                const topicCheckboxId = `topic-${topic.name.replace(/\s+/g, '-')}`;
                childrenDiv.innerHTML += `
                    <div class="mb-1">
                        <input type="checkbox" id="${topicCheckboxId}" data-parent="${category.name}" value="${topic.name}" class="child-topic">
                        <label for="${topicCheckboxId}">${topic.name}</label>
                    </div>
                `;
            });
            
            categoryDiv.appendChild(childrenDiv);
            topicsTreeContainer.appendChild(categoryDiv);
        });

        // 添加父复选框联动子复选框的逻辑
        document.querySelectorAll('.parent-topic').forEach(parent => {
            parent.addEventListener('change', (e) => {
                const categoryName = e.target.dataset.category;
                document.querySelectorAll(`.child-topic[data-parent="${categoryName}"]`).forEach(child => {
                    child.checked = e.target.checked;
                });
                updateStepIndicator();
            });
        });
        
        // 添加子复选框联动父复选框的逻辑
        document.querySelectorAll('.child-topic').forEach(child => {
            child.addEventListener('change', (e) => {
                const parentName = e.target.dataset.parent;
                const parentCheckbox = document.querySelector(`.parent-topic[data-category="${parentName}"]`);
                const siblings = document.querySelectorAll(`.child-topic[data-parent="${parentName}"]`);
                
                // 检查是否所有子复选框都被选中
                const allChecked = Array.from(siblings).every(sib => sib.checked);
                // 检查是否存在被选中的子复选框
                const someChecked = Array.from(siblings).some(sib => sib.checked);
                
                // 更新父复选框状态
                parentCheckbox.checked = allChecked;
                parentCheckbox.indeterminate = someChecked && !allChecked;
                
                updateStepIndicator();
            });
        });
    }

    /**
     * 切换侧边栏显示状态
     */
    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
        if (isSidebarOpen) {
            sidebar.classList.remove('-translate-x-full');
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            sidebarOverlay.classList.remove('hidden');
            document.body.classList.add('overflow-hidden'); // 防止背景滚动
        } else {
            sidebar.classList.add('-translate-x-full');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            sidebarOverlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }
    
    /**
     * 关闭侧边栏（仅适用于移动设备）
     */
    function closeSidebar() {
        if (window.innerWidth < 768) { // md 断点是 768px
            isSidebarOpen = false;
            sidebar.classList.add('-translate-x-full');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            sidebarOverlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }
    
    /**
     * 调整布局适应屏幕大小变化
     */
    function handleResize() {
        if (window.innerWidth >= 768) { // md 断点是 768px
            // 在大屏幕上始终显示侧边栏
            sidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        } else if (!isSidebarOpen) {
            // 在小屏幕上如果侧边栏应该关闭，确保它是关闭的
            sidebar.classList.add('-translate-x-full');
        }
    }

    /**
     * 渲染考试历史记录列表
     */
    function renderHistoryList() {
        historyList.innerHTML = '';
        if (examHistory.length === 0) {
            historyList.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-gray-400 mb-2">
                        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p class="text-sm text-gray-500 mb-1">暂无考试记录</p>
                    <p class="text-xs text-gray-400">创建新考试开始练习</p>
                </div>
            `;
            return;
        }
        examHistory.forEach((exam, index) => {
            const historyItem = document.createElement('div');
            
            // 检查是否为当前查看的考试
            const isCurrentExam = currentExam && currentExam.id === exam.id;
            
            // 根据考试状态设置样式（兼容旧数据）
            const isInProgress = exam.status === 'in_progress';
            const baseClasses = 'p-2.5 mb-1.5 border rounded-lg hover:bg-gray-50 relative transition-all duration-200 cursor-pointer';
            
            if (isCurrentExam) {
                historyItem.classList.add(...baseClasses.split(' '), 'current-exam', 'bg-blue-50', 'border-blue-200', 'shadow-sm');
            } else if (isInProgress) {
                historyItem.classList.add(...baseClasses.split(' '), 'bg-orange-50', 'border-orange-200', 'hover:bg-orange-100');
            } else {
                historyItem.classList.add(...baseClasses.split(' '), 'border-gray-200', 'hover:border-gray-300');
            }
            
            // 构建状态显示文本（兼容旧数据）
            let statusText = '';
            let scoreText = '';
            let difficultyText = '';
            
            if (isInProgress) {
                statusText = '<span class="text-orange-600 font-medium text-xs">● 未交卷</span>';
                scoreText = '进行中';
            } else {
                statusText = '<span class="text-green-600 font-medium text-xs">✓ 已完成</span>';
                // 兼容旧数据：如果没有score字段，显示为"已完成"
                scoreText = exam.score !== undefined ? `得分: ${exam.score} / 100` : '已完成';
            }
            
            // 显示难度信息（兼容旧数据）
            if (exam.difficulty) {
                const difficultyInfo = getDifficultyInfo(exam.difficulty);
                difficultyText = `<span class="text-purple-600 font-medium text-xs">🎯 ${exam.difficulty}级(${difficultyInfo.desc})</span>`;
            }
            
            // 操作按钮
            let actionButton = '';
            if (isInProgress) {
                actionButton = `
                    <button class="continue-exam-btn absolute bottom-2 right-6 text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition-colors" title="继续答题">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="M6.271 5.055a.5.5 0 0 1 .52.038L11 7.055a.5.5 0 0 1 0 .89L6.791 9.907a.5.5 0 0 1-.791-.39V5.482a.5.5 0 0 1 .271-.427z"/>
                        </svg>
                    </button>
                `;
            }
            
            // 计算题目数量信息
            const questionCount = exam.questions ? exam.questions.length : 0;
            const questionCountText = questionCount > 0 ? `${questionCount}题` : '';
            
            // 格式化时间显示（年月日时分）
            const examDate = new Date(exam.date);
            const timeText = examDate.toLocaleString('zh-CN', { 
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit', 
                minute: '2-digit'
            }).replace(/\//g, '-');
            
            historyItem.innerHTML = `
                <div class="exam-item">
                    <!-- 标题行（独立显示，完整标题） -->
                    <div class="mb-1.5">
                        <h4 class="text-sm font-bold text-gray-800 leading-tight line-clamp-2" title="${exam.title}">${exam.title}</h4>
                    </div>
                    
                    <!-- 信息行 -->
                    <div class="flex items-center justify-between text-xs mb-1.5">
                        <div class="flex items-center space-x-1.5">
                            ${questionCountText ? `<span class="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">${questionCountText}</span>` : ''}
                            ${difficultyText ? difficultyText.replace('text-purple-600 font-medium text-xs', 'bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs font-medium').replace('🎯 ', '').replace('级(', '·').replace(')', '') : ''}
                            ${exam.isCustomDatabase ? `<span class="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium" title="${exam.customDbName || '自定义题库'}">📁</span>` : ''}
                        </div>
                        <span class="text-gray-400 text-xs">${timeText}</span>
                    </div>
                    
                    <!-- 得分和状态行 -->
                    <div class="flex items-center justify-between text-xs">
                        <span class="${isInProgress ? 'text-orange-600 font-medium' : 'text-gray-600'}">${scoreText}</span>
                        <span class="ml-2 status-badge">${statusText}</span>
                    </div>
                </div>
                ${actionButton}
                <button class="delete-exam-btn absolute top-2 right-1 text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>

            `;
            
            // 点击考试项查看详情或继续答题
            historyItem.querySelector('.exam-item').addEventListener('click', () => {
                if (exam.status === 'in_progress') {
                    // 继续答题
                    continueExam(index);
                } else {
                    // 查看结果（兼容旧数据：没有status字段的都认为是已完成）
                showExamResult(index);
                }
                closeSidebar(); // 在移动端关闭侧边栏
            });
            
            // 继续答题按钮
            const continueBtn = historyItem.querySelector('.continue-exam-btn');
            if (continueBtn) {
                continueBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    continueExam(index);
                    closeSidebar();
                });
            }
            
            // 点击删除按钮删除考试
            historyItem.querySelector('.delete-exam-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡，避免触发考试项点击事件
                deleteExam(index);
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    /**
     * 继续进行中的考试
     * @param {number} index - 考试历史记录的索引
     */
    function continueExam(index) {
        if (index < 0 || index >= examHistory.length) {
            console.error('无效的考试索引:', index);
            alert('无法找到指定的考试记录');
            return;
        }
        
        const exam = examHistory[index];
        if (!exam) {
            console.error('考试数据不存在，索引:', index);
            alert('考试数据丢失或损坏');
            return;
        }
        
        // 数据完整性检查
        if (!exam.questions || !Array.isArray(exam.questions)) {
            console.error('考试题目数据缺失或格式错误:', exam);
            alert('该考试的题目数据已损坏，无法继续答题');
            return;
        }
        
        if (!exam.userAnswers || !Array.isArray(exam.userAnswers)) {
            console.warn('用户答案数据缺失，创建新的答案数组');
            exam.userAnswers = new Array(exam.questions.length).fill(null);
        }
        
        // 确保答案数组长度与题目数组一致
        if (exam.userAnswers.length !== exam.questions.length) {
            console.warn('答案数组长度与题目数组不一致，进行调整');
            const adjustedAnswers = new Array(exam.questions.length).fill(null);
            for (let i = 0; i < Math.min(exam.userAnswers.length, exam.questions.length); i++) {
                adjustedAnswers[i] = exam.userAnswers[i];
            }
            exam.userAnswers = adjustedAnswers;
            
            // 更新历史记录中的数据
            examHistory[index] = exam;
            try {
                localStorage.setItem('exam_history', JSON.stringify(examHistory));
            } catch (error) {
                console.error('保存调整后的考试数据失败:', error);
            }
        }
        
        currentExam = exam; // 设置当前考试
        
        console.log('继续答题:', exam.title || '未命名考试');
        
        try {
            // 渲染考试，使用增强的安全渲染
            renderExamSafely(exam);
            
            // 使用 setTimeout 确保DOM完全渲染后再恢复答案
            setTimeout(() => {
                // 恢复用户之前的答案
                exam.questions.forEach((q, questionIndex) => {
                    const userAnswer = exam.userAnswers[questionIndex];
                    if (userAnswer) {
                        const name = `question-${questionIndex}`;
                        if (Array.isArray(userAnswer)) {
                            // 多选题
                            userAnswer.forEach(answer => {
                                const checkbox = document.querySelector(`input[name="${name}"][value="${answer}"]`);
                                if (checkbox) checkbox.checked = true;
                            });
                        } else {
                            // 单选题或判断题
                            const radio = document.querySelector(`input[name="${name}"][value="${userAnswer}"]`);
                            if (radio) radio.checked = true;
                        }
                    }
                });
            }, 100);
            
            // 更新历史记录列表，高亮当前考试
            renderHistoryList();
            
            // 滚动到考试记录的位置
            const currentExamElement = historyList.querySelector('.current-exam');
            if (currentExamElement) {
                currentExamElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            
            switchView('exam');
            
        } catch (error) {
            console.error('继续考试时发生错误:', error);
            alert('继续考试时发生错误，请检查数据完整性');
            
            // 即使出错也要更新历史记录列表，确保界面正常
            renderHistoryList();
        }
    }

    /**
     * 安全地渲染考试内容
     * @param {object} exam - 考试对象
     */
    function renderExamSafely(exam) {
        const examTitle = exam.title || '未命名考试';
        document.getElementById('exam-title').textContent = examTitle;
        questionsContainer.innerHTML = '';

        exam.questions.forEach((q, index) => {
            // 对每个题目进行安全检查
            if (!q || typeof q.question !== 'string') {
                console.warn(`题目 ${index + 1} 数据不完整，跳过渲染`);
                const errorEl = document.createElement('div');
                errorEl.className = 'mb-6 p-4 border border-red-300 rounded-lg bg-red-50';
                errorEl.innerHTML = `
                    <p class="font-semibold mb-2 text-red-700">${index + 1}. 题目解析失败</p>
                    <p class="text-red-600 text-sm">该题目数据不完整，无法正常显示</p>
                `;
                questionsContainer.appendChild(errorEl);
                return;
            }

            const questionEl = document.createElement('div');
            questionEl.classList.add('mb-6', 'p-4', 'border-b');
            
            try {
                questionEl.innerHTML = `
                    <p class="font-semibold mb-2">${index + 1}. ${q.question}</p>
                    <div class="options-container space-y-2">
                        ${renderOptionsSafely(q, index)}
                    </div>
                `;
                questionsContainer.appendChild(questionEl);
            } catch (error) {
                console.error(`渲染题目 ${index + 1} 时发生错误:`, error);
                questionEl.innerHTML = `
                    <p class="font-semibold mb-2 text-red-700">${index + 1}. 题目渲染失败</p>
                    <p class="text-red-600 text-sm">该题目在渲染过程中发生错误</p>
                `;
                questionsContainer.appendChild(questionEl);
            }
        });
        
        // 为所有选项添加变化监听器，实时保存答案
        const allInputs = questionsContainer.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        allInputs.forEach(input => {
            input.addEventListener('change', () => {
                saveCurrentAnswers();
            });
        });
    }

    /**
     * 安全地渲染题目选项
     * @param {object} question - 题目对象
     * @param {number} questionIndex - 题目索引
     * @returns {string} - 选项的 HTML 字符串
     */
    function renderOptionsSafely(question, questionIndex) {
        const name = `question-${questionIndex}`;
        
        // 处理判断题类型
        if (question.type === 'judgment' || question.type === 'truefalse') {
            return `
                <div class="mb-3 pl-2">
                    <input type="radio" id="${name}-option-0" name="${name}" value="A" class="mr-2">
                    <label for="${name}-option-0" class="select-none">A. 正确</label>
                </div>
                <div class="mb-3 pl-2">
                    <input type="radio" id="${name}-option-1" name="${name}" value="B" class="mr-2">
                    <label for="${name}-option-1" class="select-none">B. 错误</label>
                </div>
            `;
        }

        // 安全检查：确保其他类型题目有选项数据
        if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
            console.error('题目选项数据不完整:', question);
            return '<div class="text-red-500 p-2 border border-red-300 rounded bg-red-50">该题目选项数据缺失或格式错误，无法正常显示</div>';
        }

        const optionType = question.type === 'single' ? 'radio' : 'checkbox';

        return question.options.map((option, optionIndex) => {
            const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C...
            return `
                <div class="mb-3 pl-2">
                    <input type="${optionType}" id="${name}-option-${optionIndex}" name="${name}" value="${optionLetter}" class="mr-2">
                    <label for="${name}-option-${optionIndex}" class="select-none">${optionLetter}. ${option}</label>
                </div>
            `;
        }).join('');
    }

    /**
     * 显示指定索引的考试结果
     * @param {number} index - 考试历史记录的索引
     */
    function showExamResult(index) {
        if (index < 0 || index >= examHistory.length) {
            console.error('无效的考试索引:', index);
            alert('无法找到指定的考试记录');
            return;
        }
        
        const exam = examHistory[index];
        if (!exam) {
            console.error('考试数据不存在，索引:', index);
            alert('考试数据丢失或损坏');
            return;
        }
        
        // 数据完整性检查
        if (!exam.questions || !Array.isArray(exam.questions)) {
            console.error('考试题目数据缺失或格式错误:', exam);
            alert('该考试的题目数据已损坏，无法显示结果');
            return;
        }
        
        if (!exam.userAnswers || !Array.isArray(exam.userAnswers)) {
            console.warn('用户答案数据缺失，使用空答案数组');
            exam.userAnswers = new Array(exam.questions.length).fill(null);
        }
        
        // 确保答案数组长度与题目数组一致
        if (exam.userAnswers.length !== exam.questions.length) {
            console.warn('答案数组长度与题目数组不一致，进行调整');
            const adjustedAnswers = new Array(exam.questions.length).fill(null);
            for (let i = 0; i < Math.min(exam.userAnswers.length, exam.questions.length); i++) {
                adjustedAnswers[i] = exam.userAnswers[i];
            }
            exam.userAnswers = adjustedAnswers;
        }
        
        currentExam = exam; // 将当前考试设置为历史记录中的考试，以便导出
        
        // 安全地设置结果标题和分数
        const examTitle = exam.title || '未命名考试';
        const examScore = exam.score !== undefined ? exam.score : 0;
        
        resultTitle.textContent = examTitle;
        resultScore.textContent = `最终得分: ${examScore} / 100`;
        
        try {
            // 使用增强的renderResults函数，现在包含完整的错误处理
            renderResults(exam.questions, exam.userAnswers);
            
            // 更新历史记录列表，高亮当前查看的考试
            renderHistoryList();
            
            // 滚动到考试记录的位置
            const currentExamElement = historyList.querySelector('.current-exam');
            if (currentExamElement) {
                currentExamElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            
            console.log(`显示考试结果: ${examTitle}, 得分: ${examScore}, 索引: ${index}`);
            switchView('result');
            
        } catch (error) {
            console.error('渲染考试结果时发生错误:', error);
            alert('显示考试结果时发生错误，请检查数据完整性');
            
            // 即使出错也要更新历史记录列表，确保界面正常
            renderHistoryList();
        }
    }

    /**
     * 清空所有考试记录
     */
    function clearHistory() {
        if (confirm('确定要清空所有考试记录吗？此操作不可恢复。')) {
            examHistory = [];
            localStorage.removeItem('exam_history');
            renderHistoryList();
            alert('所有记录已清空。');
        }
    }

    /**
     * 添加自定义知识点
     */
    function addCustomTopic() {
        const value = customTopicInput.value.trim();
        if (!value) return;
        
        // 可以同时添加多个，以逗号分隔
        const newTopics = value.split(/[,，、;；]/).map(t => t.trim()).filter(t => t);
        
        for (const topic of newTopics) {
            if (!customTopics.includes(topic)) {
                customTopics.push(topic);
            }
        }
        
        renderCustomTopics();
        customTopicInput.value = '';
        updateStepIndicator();
    }

    /**
     * 获取难度描述信息
     * @param {number} difficulty - 难度级别 (1-10)
     * @returns {object} - 包含描述、提示等信息的对象
     */
    function getDifficultyInfo(difficulty) {
        const difficultyMap = {
            1: { desc: '入门级', hint: '适合零基础学习者，题目涉及最基本的概念和定义' },
            2: { desc: '初级', hint: '适合初学者，题目涉及基础知识点的理解和应用' },
            3: { desc: '初级+', hint: '适合有少量基础的学习者，题目涉及基础概念的扩展' },
            4: { desc: '中级-', hint: '适合有一定基础的学习者，题目开始涉及知识点的综合运用' },
            5: { desc: '中等难度', hint: '适合有一定基础的学习者，题目涉及常见概念和应用场景' },
            6: { desc: '中级+', hint: '适合有扎实基础的学习者，题目涉及深层次的理解和分析' },
            7: { desc: '中高级', hint: '适合有丰富经验的学习者，题目涉及复杂场景和解决方案' },
            8: { desc: '高级', hint: '适合专业人士，题目涉及系统性思考和高级技术细节' },
            9: { desc: '高级+', hint: '适合资深专家，题目涉及架构设计和最佳实践方案' },
            10: { desc: '专家级', hint: '适合技术专家，题目涉及前沿技术和复杂系统设计' }
        };
        
        return difficultyMap[difficulty] || difficultyMap[5];
    }

    /**
     * 更新难度显示
     */
    function updateDifficultyDisplay() {
        const difficulty = parseInt(examDifficultyInput.value);
        const info = getDifficultyInfo(difficulty);
        
        difficultyLabel.textContent = difficulty;
        difficultyDescription.textContent = info.desc;
        difficultyHint.textContent = info.hint;
        
        // 更新滑块的填充效果
        const percentage = ((difficulty - 1) / (10 - 1)) * 100;
        examDifficultyInput.style.setProperty('--difficulty-value', `${percentage}%`);
        
        console.log(`难度已设置为 ${difficulty} 级 (${info.desc})`);
    }
    
    /**
     * 渲染自定义知识点标签
     */
    function renderCustomTopics() {
        customTopicsList.innerHTML = '';
        
        customTopics.forEach(topic => {
            const tag = document.createElement('div');
            tag.classList.add('bg-blue-100', 'text-blue-800', 'rounded', 'px-2', 'py-1', 'm-1', 'text-sm', 'flex', 'items-center');
            
            tag.innerHTML = `
                <span>${topic}</span>
                <button class="ml-1 text-blue-500 hover:text-blue-700 font-bold" data-topic="${topic}">×</button>
            `;
            
            tag.querySelector('button').addEventListener('click', (e) => {
                const topicToRemove = e.target.dataset.topic;
                customTopics = customTopics.filter(t => t !== topicToRemove);
                renderCustomTopics();
                updateStepIndicator();
            });
            
            customTopicsList.appendChild(tag);
        });
    }

    /**
     * 显示进度信息
     * @param {string} message - 进度消息
     * @param {number} percent - 进度百分比，0-100
     * @param {boolean} animated - 是否显示动画效果
     */
    function updateProgress(message, percent, animated = false) {
        loadingMessage.textContent = message;
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${Math.round(percent)}% 完成`;
        
        // 同时更新遮罩层的进度
        updateOverlayProgress(message, percent);
        
        // 添加动画效果
        if (animated) {
            progressBar.classList.add('progress-bar-animated');
        } else {
            progressBar.classList.remove('progress-bar-animated');
        }
    }

    // 日志记录数组
    let generationLogs = [];

    /**
     * 添加生成日志
     * @param {string} message - 日志消息
     * @param {string} type - 日志类型: info, success, warning, error
     */
    function addGenerationLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            time: timestamp,
            message: message,
            type: type
        };
        
        generationLogs.push(logEntry);
        
        // 限制日志数量
        if (generationLogs.length > 50) {
            generationLogs = generationLogs.slice(-50);
        }
        
        updateLogDisplay();
    }

    /**
     * 更新日志显示
     */
    function updateLogDisplay() {
        if (!generationLog) return;
        
        const logHtml = generationLogs.map(log => {
            let colorClass = 'text-gray-600';
            let icon = '•';
            
            switch (log.type) {
                case 'success':
                    colorClass = 'text-green-600';
                    icon = '✓';
                    break;
                case 'warning':
                    colorClass = 'text-orange-600';
                    icon = '⚠';
                    break;
                case 'error':
                    colorClass = 'text-red-600';
                    icon = '✗';
                    break;
            }
            
            return `<div class="${colorClass}"><span class="text-gray-400">[${log.time}]</span> ${icon} ${log.message}</div>`;
        }).join('');
        
        generationLog.innerHTML = logHtml || '<div class="text-gray-500">暂无日志...</div>';
        
        // 自动滚动到底部
        generationLog.scrollTop = generationLog.scrollHeight;
    }

    /**
     * 显示实时生成遮罩层
     */
    function showRealtimeOverlay() {
        if (realtimeOverlay) {
            realtimeOverlay.classList.remove('hidden');
            
            // 清空之前的内容
            if (realtimeQuestionsContainer) {
                realtimeQuestionsContainer.innerHTML = `
                    <div class="text-center text-gray-400 py-8 waiting-placeholder">
                        <div class="animate-pulse">
                            <div class="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                            <p>等待题目数据...</p>
                        </div>
                    </div>
                `;
                console.log('🎭 弹窗已显示，等待题目数据...');
                console.log('📦 realtimeQuestionsContainer 存在:', !!realtimeQuestionsContainer);
            }
            
            // 确保显示生成状态，隐藏完成操作
            if (generationStatus) {
                generationStatus.classList.remove('hidden');
            }
            if (completionActions) {
                completionActions.classList.add('hidden');
            }
            
            // 清空之前的日志
            generationLogs = [];
            addGenerationLog('🚀 开始生成考试题目...', 'info');
        }
    }

    // 倒计时定时器
    let countdownInterval = null;

    /**
     * 显示完成操作（确认按钮和倒计时）
     */
    function showCompletionActions() {
        // 隐藏生成状态提示
        if (generationStatus) {
            generationStatus.classList.add('hidden');
        }
        
        // 显示完成操作区域
        if (completionActions) {
            completionActions.classList.remove('hidden');
        }
        
        // 启动10秒倒计时
        let countdown = 10;
        if (countdownTimer) {
            countdownTimer.textContent = countdown;
        }
        
        addGenerationLog('⏰ 10秒后自动开始答题，或点击确认按钮', 'info');
        
        countdownInterval = setInterval(() => {
            countdown--;
            if (countdownTimer) {
                countdownTimer.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                startExam();
            }
        }, 1000);
    }

    /**
     * 开始考试（关闭弹窗，解锁页面）
     */
    function startExam() {
        // 清除倒计时
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        addGenerationLog('✅ 开始答题', 'success');
        console.log('🎭 准备关闭弹窗，进入答题模式');
        
        hideRealtimeOverlay(); // 隐藏实时生成遮罩层
        lockPageInteraction(false); // 解锁页面操作
        console.log('✅ 页面已解锁，用户可以开始答题');
    }

    /**
     * 隐藏实时生成遮罩层
     */
    function hideRealtimeOverlay() {
        if (realtimeOverlay) {
            realtimeOverlay.classList.add('hidden');
        }
        
        // 清除倒计时（如果存在）
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }

    /**
     * 更新遮罩层进度
     * @param {string} message - 进度消息
     * @param {number} percent - 进度百分比
     */
    function updateOverlayProgress(message, percent) {
        if (overlayProgressBar && overlayProgressText) {
            overlayProgressBar.style.width = `${percent}%`;
            overlayProgressText.textContent = `${message} (${Math.round(percent)}%)`;
        }
        // 不再自动添加进度日志，让日志更简洁
    }

    /**
     * 在遮罩层中渲染实时题目（完整格式，不可操作）
     * @param {object} question - 题目对象
     * @param {number} index - 题目索引
     */
    function renderRealtimeQuestion(question, index) {
        if (!realtimeQuestionsContainer) {
            console.error('⚠️ realtimeQuestionsContainer 不存在，无法显示实时题目');
            return;
        }

        console.log(`🎯 准备在弹窗中渲染第 ${index + 1} 道题目:`, question.question.substring(0, 50) + '...');

        // 清空等待提示（如果还存在）
        const waitingMsg = realtimeQuestionsContainer.querySelector('.waiting-placeholder');
        if (waitingMsg) {
            console.log('清空等待提示信息');
            waitingMsg.remove();
        }
        
        // 使用唯一ID检查是否已经显示过这个题目（避免重复）
        const questionId = `realtime-q-${index}`;
        if (document.getElementById(questionId)) {
            console.log(`⚠️ 第 ${index + 1} 道题目已经显示过，跳过`);
            return;
        }

        const questionEl = document.createElement('div');
        questionEl.id = questionId; // 设置唯一ID
        questionEl.classList.add('bg-white', 'rounded-lg', 'p-4', 'md:p-6', 'border', 'border-gray-200', 'shadow-sm', 'mb-3', 'md:mb-4', 'realtime-question-item');
        questionEl.style.opacity = '0';
        questionEl.style.transform = 'translateY(10px)';
        
        // 获取题目类型显示文本
        const typeMap = {
            'single': '单选题',
            'multiple': '多选题', 
            'judgment': '判断题',
            'truefalse': '判断题'
        };
        const typeText = typeMap[question.type] || '未知类型';
        
        // 渲染完整格式的题目，但禁用所有输入
        const questionHtml = `
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    ${index + 1}
                </div>
                <div class="flex-grow">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            ${typeText}
                        </span>
                        <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            ✓ 已生成
                        </span>
                    </div>
                    
                    <h3 class="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 leading-relaxed">${question.question}</h3>
                    
                    <div class="space-y-3">
                        ${renderRealtimeOptions(question, index)}
                    </div>
                </div>
            </div>
        `;

        questionEl.innerHTML = questionHtml;
        realtimeQuestionsContainer.appendChild(questionEl);
        
        console.log(`✅ 第 ${index + 1} 道题目已添加到弹窗中，容器当前有 ${realtimeQuestionsContainer.children.length} 个子元素`);
        
        // 添加淡入动画
        setTimeout(() => {
            questionEl.style.transition = 'all 0.3s ease';
            questionEl.style.opacity = '1';
            questionEl.style.transform = 'translateY(0)';
            console.log(`🎨 第 ${index + 1} 道题目淡入动画完成`);
        }, 50);

        // 自动滚动到最新题目
        setTimeout(() => {
            questionEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
            console.log(`📜 自动滚动到第 ${index + 1} 道题目`);
        }, 100);
    }

    /**
     * 渲染实时题目的选项（禁用状态）
     * @param {object} question - 题目对象
     * @param {number} questionIndex - 题目索引
     * @returns {string} - 选项的 HTML 字符串
     */
    function renderRealtimeOptions(question, questionIndex) {
        const name = `realtime-question-${questionIndex}`;
        
        // 处理判断题类型
        if (question.type === 'judgment' || question.type === 'truefalse') {
            return `
                <div class="mb-3 pl-2">
                    <input type="radio" id="${name}-option-0" name="${name}" value="A" class="mr-2" disabled>
                    <label for="${name}-option-0" class="select-none text-gray-600">A. 正确</label>
                </div>
                <div class="mb-3 pl-2">
                    <input type="radio" id="${name}-option-1" name="${name}" value="B" class="mr-2" disabled>
                    <label for="${name}-option-1" class="select-none text-gray-600">B. 错误</label>
                </div>
            `;
        }

        // 安全检查：确保其他类型题目有选项数据
        if (!question || !question.options || !Array.isArray(question.options)) {
            return '<div class="text-red-500">题目选项数据异常</div>';
        }

        const optionType = question.type === 'single' ? 'radio' : 'checkbox';

        return question.options.map((option, optionIndex) => {
            const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C...
            return `
                <div class="mb-3 pl-2">
                    <input type="${optionType}" id="${name}-option-${optionIndex}" name="${name}" value="${optionLetter}" class="mr-2" disabled>
                    <label for="${name}-option-${optionIndex}" class="select-none text-gray-600">${optionLetter}. ${option}</label>
                </div>
            `;
        }).join('');
    }

    /**
     * 更新步骤指示器
     */
    function updateStepIndicator() {
        try {
            // 查找步骤指示器容器，使用更宽泛的选择器
            const stepIndicators = document.querySelectorAll('.flex.items-center > div.flex.items-center');
            
            if (stepIndicators.length === 0) {
                // 尝试备用选择器
                const altStepContainer = document.querySelector('.flex.justify-center.mb-8');
                if (!altStepContainer) {
                    console.log('步骤指示器容器未找到，跳过更新');
                    return;
                }
                const altStepElements = altStepContainer.querySelectorAll('.flex.items-center');
                if (altStepElements.length < 3) {
                    console.log('步骤指示器元素不足，跳过更新');
                    return;
                }
                // 使用备用元素
                updateStepIndicatorElements(altStepElements);
                return;
            }
            
            if (stepIndicators.length < 3) {
                console.log('步骤指示器元素不足，跳过更新');
                return;
            }
            
            updateStepIndicatorElements(stepIndicators);
            
        } catch (error) {
            console.log('步骤指示器更新出错:', error.message);
        }
    }

    /**
     * 更新步骤指示器元素
     * @param {NodeList} stepElements - 步骤元素列表
     */
    function updateStepIndicatorElements(stepElements) {
        const step1Circle = stepElements[0].querySelector('div:first-child');
        const step1Text = stepElements[0].querySelector('span');
        const step2Circle = stepElements[1].querySelector('div:first-child');
        const step2Text = stepElements[1].querySelector('span');
        const step3Circle = stepElements[2].querySelector('div:first-child');
        const step3Text = stepElements[2].querySelector('span');
        
        if (!step1Circle || !step2Circle || !step3Circle) {
            console.log('步骤指示器子元素未找到，跳过更新');
            return;
        }
        
        // 重置所有步骤状态
        step1Circle.className = 'flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-500 rounded-full text-sm font-medium';
        if (step1Text) step1Text.className = 'ml-2 text-sm font-medium text-gray-500';
        step2Circle.className = 'flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-500 rounded-full text-sm font-medium';
        if (step2Text) step2Text.className = 'ml-2 text-sm font-medium text-gray-500';
        step3Circle.className = 'flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-500 rounded-full text-sm font-medium';
        if (step3Text) step3Text.className = 'ml-2 text-sm font-medium text-gray-500';
        
        // 检查步骤1：是否选择了题库来源和知识点
        let step1Complete = false;
        if (sourceModelRadio && sourceModelRadio.checked) {
            // 大模型生成：需要选择知识点或自定义知识点
            const selectedTopics = document.querySelectorAll('.child-topic:checked');
            step1Complete = selectedTopics.length > 0 || customTopics.length > 0;
        } else if (sourceCustomRadio && sourceCustomRadio.checked) {
            // 自定义题库：需要上传文件
            step1Complete = customDatabaseContent !== null;
        } else if (sourcePasteRadio && sourcePasteRadio.checked) {
            // 粘贴内容：需要有内容
            step1Complete = pasteContent !== null && pasteContent.trim().length > 0;
        }
        
        if (step1Complete) {
            step1Circle.className = 'flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-medium';
            if (step1Text) step1Text.className = 'ml-2 text-sm font-medium text-gray-700';
            
            // 激活步骤2
            step2Circle.className = 'flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium';
            if (step2Text) step2Text.className = 'ml-2 text-sm font-medium text-gray-700';
        } else {
            // 步骤1未完成，激活步骤1
            step1Circle.className = 'flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium';
            if (step1Text) step1Text.className = 'ml-2 text-sm font-medium text-gray-700';
        }
    }

    /**
     * 处理题库来源选择变化
     */
    function handleSourceChange() {
        // 隐藏所有选项容器
        customDatabaseContainer.classList.add('hidden');
        pasteContentContainer.classList.add('hidden');
        previewContainer.classList.add('hidden');
        
        // 移除提示文本
        const hintDiv = document.getElementById('customDbHint');
        if (hintDiv) {
            hintDiv.remove();
        }
        
        // 获取知识点选择区域的容器
        const knowledgePointsSection = topicsTreeContainer.closest('.bg-white.rounded-xl.shadow-lg');
        
        if (sourceCustomRadio.checked) {
            // 显示自定义题库上传区域
            customDatabaseContainer.classList.remove('hidden');
            
            // 隐藏知识点选择区域
            if (knowledgePointsSection) {
                knowledgePointsSection.style.display = 'none';
            }
            
        } else if (sourcePasteRadio.checked) {
            // 显示粘贴内容区域
            pasteContentContainer.classList.remove('hidden');
            
            // 隐藏知识点选择区域
            if (knowledgePointsSection) {
                knowledgePointsSection.style.display = 'none';
            }
            
        } else {
            // AI生成模式：显示知识点选择区域
            if (knowledgePointsSection) {
                knowledgePointsSection.style.display = 'block';
            }
            
            // 知识点选择区域恢复正常状态
            topicsTreeContainer.classList.remove('opacity-50');
        }
        
        // 更新步骤指示器
        updateStepIndicator();
    }

    /**
     * 获取文件扩展名
     * @param {string} filename - 文件名
     * @returns {string} - 文件扩展名（小写）
     */
    function getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
    }

    /**
     * 解析TXT文件
     * @param {File} file - 文件对象
     * @returns {Promise<string>} - 解析后的文本内容
     */
    function parseTxtFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('TXT文件读取失败'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * 解析DOCX文件
     * @param {File} file - 文件对象
     * @returns {Promise<string>} - 解析后的文本内容
     */
    function parseDocxFile(file) {
        return new Promise((resolve, reject) => {
            if (typeof mammoth === 'undefined') {
                reject(new Error('DOCX解析库未加载，请刷新页面重试'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    if (result.value.trim().length === 0) {
                        reject(new Error('DOCX文件内容为空或无法解析'));
                    } else {
                        resolve(result.value);
                    }
                } catch (error) {
                    reject(new Error('DOCX文件解析失败: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('DOCX文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }







    /**
     * 获取文件类型图标
     * @param {string} extension - 文件扩展名
     * @returns {string} - 文件类型HTML标签
     */
    function getFileTypeIcon(extension) {
        const iconMap = {
            'txt': '<span class="file-type-icon file-type-txt">TXT</span>',
            'docx': '<span class="file-type-icon file-type-docx">DOCX</span>'
        };
        return iconMap[extension] || '';
    }

    /**
     * 显示文件解析进度
     * @param {string} message - 进度消息
     */
    function showFileParsingProgress(message) {
        fileNameDisplay.innerHTML = message;
        fileNameDisplay.classList.remove('text-gray-500', 'text-green-600', 'text-red-600');
        fileNameDisplay.classList.add('text-blue-600');
    }

    /**
     * 显示文件信息
     * @param {string} fileName - 文件名
     * @param {string} extension - 文件扩展名
     * @param {string} status - 状态：'success', 'error', 'parsing'
     * @param {string} message - 额外消息
     */
    function showFileInfo(fileName, extension, status = 'success', message = '') {
        const icon = getFileTypeIcon(extension);
        let content = `${icon}${fileName}`;
        
        if (message) {
            content += ` - ${message}`;
        }
        
        fileNameDisplay.innerHTML = content;
        fileNameDisplay.classList.remove('text-gray-500', 'text-green-600', 'text-blue-600', 'text-red-600');
        
        switch (status) {
            case 'success':
                fileNameDisplay.classList.add('text-green-600');
                break;
            case 'error':
                fileNameDisplay.classList.add('text-red-600');
                break;
            case 'parsing':
                fileNameDisplay.classList.add('text-blue-600');
                break;
            default:
                fileNameDisplay.classList.add('text-gray-500');
        }
    }

    /**
     * 检查文件大小并显示警告
     * @param {number} sizeInMB - 文件大小（MB）
     * @param {string} fileExt - 文件扩展名
     * @returns {boolean} - 是否继续处理
     */
    function checkFileSize(sizeInMB, fileExt) {
        const container = customDatabaseContainer.querySelector('.bg-gray-50');
        
        // 移除之前的警告
        const existingWarning = container.querySelector('.large-file-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        // 针对不同文件类型的大小建议
        let warningThreshold = 10;
        let confirmThreshold = 50;
        
        if (fileExt === 'docx') {
            warningThreshold = 5;  // DOCX文件通常较小
            confirmThreshold = 25;
        } else if (fileExt === 'txt') {
            warningThreshold = 2;  // TXT文件应该更小
            confirmThreshold = 10;
        }
        
        if (sizeInMB > warningThreshold) {
            const warning = document.createElement('div');
            warning.className = 'large-file-warning';
            warning.innerHTML = `文件较大 (${sizeInMB.toFixed(1)}MB)，解析可能需要较长时间，请耐心等待...`;
            
            container.appendChild(warning);
        }
        
        if (sizeInMB > confirmThreshold) {
            const shouldContinue = confirm(`文件大小为 ${sizeInMB.toFixed(1)}MB，处理可能需要很长时间或导致浏览器卡顿。是否继续？`);
            return shouldContinue;
        }
        
        return true;
    }



    /**
     * 处理题库文件选择
     */
    async function handleFileSelect() {
        const file = customDatabaseFile.files[0];
        if (!file) return;

        const fileName = file.name;
        const fileExt = getFileExtension(fileName);
        const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB

        console.log(`开始解析文件: ${fileName} (${fileSize}MB, ${fileExt}格式)`);

        // 检查文件大小
        if (!checkFileSize(parseFloat(fileSize), fileExt)) {
            // 用户取消处理大文件
            customDatabaseFile.value = '';
                fileNameDisplay.textContent = '未选择文件';
                fileNameDisplay.classList.add('text-gray-500');
            return;
        }

        // 显示文件信息
        showFileInfo(fileName, fileExt, 'success');

        try {
            let parsedContent = '';

            // 显示解析进度
            showFileParsingProgress(`正在解析 ${fileExt.toUpperCase()} 文件...`);

            // 根据文件扩展名选择解析方法
            switch (fileExt) {
                case 'txt':
                    parsedContent = await parseTxtFile(file);
                    break;
                case 'docx':
                    parsedContent = await parseDocxFile(file);
                    break;
                default:
                    throw new Error(`不支持的文件格式: ${fileExt.toUpperCase()}，请使用TXT或DOCX格式的文件`);
            }

            // 验证解析结果
            if (!parsedContent || parsedContent.trim().length === 0) {
                throw new Error('文件内容为空或无法解析');
            }

            // 清理文本内容
            parsedContent = parsedContent.trim()
                .replace(/\r\n/g, '\n')  // 统一换行符
                .replace(/\s{3,}/g, '\n\n'); // 合并多余空白

            customDatabaseContent = parsedContent;

            // 清理处理标识
            
            // 显示解析成功状态
            showFileInfo(fileName, fileExt, 'success', `解析完成 (${(parsedContent.length / 1024).toFixed(1)}KB)`);

            console.log(`文件解析完成，内容长度: ${parsedContent.length} 字符`);

            // 显示预览
            showPreview(parsedContent, 'file');
            updateStepIndicator();

        } catch (error) {
            console.error('文件解析失败:', error);
            
            // 清理处理标识
            
            // 处理解析错误
            customDatabaseContent = null;
            showFileInfo(fileName, fileExt, 'error', error.message);

            // 8秒后恢复初始状态（给用户更多时间阅读错误信息）
            setTimeout(() => {
                fileNameDisplay.innerHTML = '未选择文件';
                                    fileNameDisplay.classList.remove('text-red-600');
                fileNameDisplay.classList.add('text-gray-500');
                customDatabaseFile.value = '';
                
                // 移除所有警告信息
                const container = customDatabaseContainer.querySelector('.bg-gray-50');
                const existingElements = container?.querySelectorAll('.large-file-warning');
                if (existingElements) {
                    existingElements.forEach(element => element.remove());
                }
            }, 8000);

            // 隐藏预览
            previewContainer.classList.add('hidden');
            updateStepIndicator();
        }
    }

    /**
     * 显示题库内容预览
     * @param {string} content - 要预览的内容
     * @param {string} source - 来源类型 ('file' 或 'paste')
     */
    function showPreview(content, source) {
        if (!content || content.trim().length === 0) {
            previewContainer.classList.add('hidden');
            return;
        }
        
        currentPreviewContent = content;
        originalPreviewContent = content; // 保存原始内容
        
        // 自动更新对应的存储变量
        if (sourceCustomRadio.checked) {
            customDatabaseContent = content;
            console.log('✅ 自定义题库内容已自动设置为预览内容');
        } else if (sourcePasteRadio.checked) {
            pasteContent = content;
            console.log('✅ 粘贴内容已自动设置为预览内容');
        }
        
        // 显示完整预览内容，不截断
        previewContent.textContent = content;
        previewContainer.classList.remove('hidden');
        
        // 隐藏编辑区域
        editPreviewArea.classList.add('hidden');
        previewContent.classList.remove('hidden');
        
        console.log(`📖 显示${source}内容预览，内容长度: ${content.length}字符`);
    }

    /**
     * 编辑预览内容
     */
    function editPreview() {
        // 保存当前预览内容作为编辑前的内容（用于取消时恢复）
        originalPreviewContent = currentPreviewContent;
        
        editContentArea.value = currentPreviewContent;
        editPreviewArea.classList.remove('hidden');
        previewContent.classList.add('hidden');
        
        console.log('📝 开始编辑预览内容');
    }

    /**
     * 保存编辑的内容
     */
    function saveEdit() {
        const editedContent = editContentArea.value.trim();
        if (editedContent.length === 0) {
            alert('内容不能为空');
            return;
        }
        
        // 更新预览内容
        currentPreviewContent = editedContent;
        previewContent.textContent = editedContent;
        
        // 更新对应的存储变量
        if (sourceCustomRadio.checked) {
            customDatabaseContent = editedContent;
            console.log('✅ 自定义题库内容已更新，新内容长度:', editedContent.length);
            console.log('📝 题库内容预览（前200字符）:', editedContent.substring(0, 200) + '...');
        } else if (sourcePasteRadio.checked) {
            pasteContent = editedContent;
            pasteContentArea.value = editedContent;
            console.log('✅ 粘贴内容已更新，新内容长度:', editedContent.length);
        }
        
        // 隐藏编辑区域，显示预览
        editPreviewArea.classList.add('hidden');
        previewContent.classList.remove('hidden');
        
        // 视觉反馈
        saveEditBtn.textContent = '已保存';
        saveEditBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        saveEditBtn.classList.add('bg-green-500');
        
        // 2秒后恢复按钮状态
        setTimeout(() => {
            saveEditBtn.textContent = '保存修改';
            saveEditBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
            saveEditBtn.classList.remove('bg-green-500');
        }, 2000);
        
        console.log('✅ 内容编辑已保存并更新到预览窗口，新内容长度:', editedContent.length);
    }

    /**
     * 取消编辑
     */
    function cancelEdit() {
        // 恢复到编辑前的内容
        if (originalPreviewContent !== null) {
            currentPreviewContent = originalPreviewContent;
            previewContent.textContent = originalPreviewContent;
            
            // 恢复对应的存储变量
            if (sourceCustomRadio.checked) {
                customDatabaseContent = originalPreviewContent;
                console.log('⏪ 已恢复自定义题库内容到编辑前状态');
            } else if (sourcePasteRadio.checked) {
                pasteContent = originalPreviewContent;
                pasteContentArea.value = originalPreviewContent;
                console.log('⏪ 已恢复粘贴内容到编辑前状态');
            }
        }
        
        editPreviewArea.classList.add('hidden');
        previewContent.classList.remove('hidden');
        
        console.log('✅ 已取消编辑，内容已恢复到修改前状态');
    }



    /**
     * 重新上传或重新粘贴
     */
    function reUpload() {
        // 清空当前内容
        currentPreviewContent = null;
        originalPreviewContent = null;
        
        if (sourceCustomRadio.checked) {
            // 重新上传文件
            customDatabaseContent = null;
            customDatabaseFile.value = '';
            fileNameDisplay.innerHTML = '未选择文件';
            fileNameDisplay.classList.add('text-gray-500');
            fileNameDisplay.classList.remove('text-green-600', 'text-blue-600', 'text-red-600');
            
            // 移除所有警告信息
            const container = customDatabaseContainer.querySelector('.bg-gray-50');
            const existingElements = container?.querySelectorAll('.large-file-warning');
            if (existingElements) {
                existingElements.forEach(element => element.remove());
            }
        } else if (sourcePasteRadio.checked) {
            // 清空粘贴区域
            pasteContent = null;
            pasteContentArea.value = '';
            pasteContentArea.focus();
        }
        
        // 隐藏预览
        previewContainer.classList.add('hidden');
        
        console.log('🔄 已重置，可以重新上传或粘贴内容');
    }

    /**
     * 处理粘贴内容变化
     */
    function handlePasteContentChange() {
        const content = pasteContentArea.value.trim();
        if (content.length > 0) {
            pasteContent = content;
            showPreview(content, 'paste');
        } else {
            pasteContent = null;
            previewContainer.classList.add('hidden');
        }
        updateStepIndicator();
    }

    /**
     * 生成试卷（使用流式输出）
     */
    async function generateExam() {
        console.log('开始生成试卷...');
        if (!apiKey) {
            alert('请先配置您的 API Key。');
            showApiKeyModal();
            console.log('API Key未设置，中止操作');
            return;
        }

        // 获取题库来源
        const isUsingCustomDatabase = sourceCustomRadio.checked;
        const isUsingPasteContent = sourcePasteRadio.checked;
        
        // 检查自定义题库
        if (isUsingCustomDatabase && !customDatabaseContent) {
            alert('您选择了自定义题库，但未上传题库文件。请选择文件后再试。');
            return;
        }
        
        // 检查粘贴内容
        if (isUsingPasteContent && !pasteContent) {
            alert('您选择了粘贴题库内容，但未粘贴任何内容。请粘贴内容后再试。');
            return;
        }

        // 获取选中的预设知识点
        const selectedTreeTopics = Array.from(document.querySelectorAll('.child-topic:checked')).map(cb => cb.value);
        
        // 合并预设和自定义知识点
        const allSelectedTopics = [...selectedTreeTopics, ...customTopics];
        console.log('已选主题:', allSelectedTopics);
        
        // 使用大模型生成时，需要选择知识点范畴
        if (!isUsingCustomDatabase && !isUsingPasteContent && allSelectedTopics.length === 0) {
            alert('请至少选择或输入一个题目范畴。');
            console.log('未选择任何主题，中止操作');
            return;
        }

        const numQuestions = parseInt(numQuestionsInput.value);
        const examDifficulty = parseInt(examDifficultyInput.value);
        
        // 根据题库来源设置范畴名称和内容
        let topicsString, sourceContent;
        if (isUsingCustomDatabase) {
            topicsString = "自定义题库";
            sourceContent = customDatabaseContent;
        } else if (isUsingPasteContent) {
            topicsString = "粘贴内容";
            sourceContent = pasteContent;
        } else {
            topicsString = allSelectedTopics.join('、');
            sourceContent = topicsString;
        }
        console.log(`将流式生成 ${numQuestions} 道关于 ${topicsString} 的题目，难度级别: ${examDifficulty}`);

        // 更新步骤指示器到第3步
        try {
            const stepContainer = document.querySelector('.flex.justify-center.mb-8');
            if (stepContainer) {
                const stepElements = stepContainer.querySelectorAll('.flex.items-center');
                if (stepElements.length >= 3) {
                    const step3Circle = stepElements[2].querySelector('div:first-child');
                    const step3Text = stepElements[2].querySelector('span');
                    if (step3Circle && step3Text) {
                        step3Circle.className = 'flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium';
                        step3Text.className = 'ml-2 text-sm font-medium text-gray-700';
                    }
                }
            }
        } catch (error) {
            console.log('步骤指示器第3步更新失败:', error.message);
        }

        // 更新UI，显示考试页面但不锁定，先显示遮罩层
        switchView('exam');
        loadingIndicator.classList.add('hidden');
        examContent.classList.remove('hidden');
        
        // 显示实时生成遮罩层
        showRealtimeOverlay();
        
        // 锁定页面操作
        lockPageInteraction(true);
        
        // 初始化题目容器和考试对象
        questionsContainer.innerHTML = '';
        
        // 创建考试对象
        let examTitle, examTopics, customDbName = null;
        
        if (isUsingCustomDatabase) {
            examTitle = `基于自定义题库的模拟考试`;
            examTopics = ["自定义题库"];
            customDbName = customDatabaseFile.files[0]?.name || "未命名题库";
        } else if (isUsingPasteContent) {
            examTitle = `基于粘贴内容的模拟考试`;
            examTopics = ["粘贴内容"];
            customDbName = "粘贴内容";
        } else {
            examTitle = `关于 ${topicsString} 的模拟考试`;
            examTopics = allSelectedTopics;
        }
        
        currentExam = {
            id: Date.now(),
            title: examTitle,
            date: new Date().toISOString(),
            questions: [],
            userAnswers: [],  
            topics: examTopics,
            isCustomDatabase: isUsingCustomDatabase || isUsingPasteContent,
            customDbName: customDbName,
            difficulty: examDifficulty,
            score: 0,
            status: 'in_progress',
            lastAnswerTime: new Date().toISOString()
        };

        // 设置考试标题
        document.getElementById('exam-title').textContent = currentExam.title;

        try {
            // 创建批量生成提示词
            let prompt;
            if (isUsingCustomDatabase) {
                console.log('🔍 生成考试 - 使用自定义题库内容');
                prompt = createCustomDatabasePrompt(numQuestions, sourceContent, examDifficulty);
            } else if (isUsingPasteContent) {
                console.log('🔍 生成考试 - 使用粘贴内容');
                prompt = createCustomDatabasePrompt(numQuestions, sourceContent, examDifficulty);
            } else {
                console.log('🔍 生成考试 - 使用AI智能生成');
                prompt = createPrompt(sourceContent, numQuestions, examDifficulty);
            }
            
            console.log('提示词已生成，开始流式调用大模型...');
            addGenerationLog(`🚀 开始生成 ${numQuestions} 道题目`, 'info');
            updateProgress('正在连接DeepSeek API...', 5, true);
            
            // 流式生成所有题目
            await generateExamWithStream(prompt, numQuestions);
            
            // 所有题目生成完成
            updateProgress('所有题目生成完成，正在准备试卷...', 95);
            
            // 立即将考试添加到历史记录（标记为进行中）
            examHistory.unshift(currentExam);
            
            // 限制历史记录数量
            if (examHistory.length > 20) {
                examHistory = examHistory.slice(0, 20);
            }
            
            // 保存到本地存储
            try {
                localStorage.setItem('exam_history', JSON.stringify(examHistory));
                console.log('进行中的考试已保存到历史记录');
            } catch (error) {
                console.error('保存考试记录失败:', error);
            }
            
            // 更新历史记录显示
            renderHistoryList();
            
            // 为所有选项添加变化监听器，实时保存答案
            const allInputs = questionsContainer.querySelectorAll('input[type="radio"], input[type="checkbox"]');
            allInputs.forEach(input => {
                input.addEventListener('change', () => {
                    saveCurrentAnswers();
                });
            });
            
            updateProgress('试卷生成完成！', 100);
            addGenerationLog('🎉 试卷生成完成！共生成 ' + currentExam.questions.length + ' 道题目', 'success');
            console.log('流式生成试卷完成，共生成题目数:', currentExam.questions.length);
            
            // 显示确认按钮和倒计时
            showCompletionActions();
            
        } catch (error) {
            console.error('流式生成试卷失败:', error);
            addGenerationLog(`❌ 生成失败: ${error.message}`, 'error');
            
            // 隐藏遮罩层
            hideRealtimeOverlay();
            
            // 如果有部分题目成功生成，询问用户是否继续
            if (currentExam && currentExam.questions.length > 0) {
                addGenerationLog(`⚠ 部分题目生成成功 (${currentExam.questions.length}道)，询问用户是否继续`, 'warning');
                const continueWithPartial = confirm(`生成过程中出现错误，但已成功生成 ${currentExam.questions.length} 道题目。\n是否继续使用这些题目进行考试？`);
                
                if (continueWithPartial) {
                    // 用户选择继续，显示已生成的题目
                    addGenerationLog('✅ 用户选择继续，使用部分题目开始考试', 'success');
                    updateProgress('考试准备完成', 100, false);
                    setTimeout(() => {
                        lockPageInteraction(false);
                        console.log('使用部分题目继续考试');
                    }, 500);
                    return;
                } else {
                    addGenerationLog('❌ 用户选择不继续，返回设置页面', 'error');
                }
            }
            
            // 完全失败或用户选择不继续，返回设置页面
            alert(`生成试卷失败: ${error.message}`);
            lockPageInteraction(false);
            switchView('setup');
        }
    }
    
    // 进度模拟相关变量
    let progressInterval = null;
    let currentProgress = 0;
    
    /**
     * 开始模拟进度更新
     */
    function startProgressSimulation() {
        currentProgress = 15; // 从15%开始
        
        // 清除可能存在的旧计时器
        if (progressInterval) clearInterval(progressInterval);
        
        // 创建新的进度更新计时器
        progressInterval = setInterval(() => {
            // 缓慢增加进度，但不超过85%
            if (currentProgress < 85) {
                // 进度越高，增长越慢
                const increment = 85 - currentProgress > 30 ? 2 : 0.5;
                currentProgress += increment;
                updateProgress('正在生成题目，请耐心等待...', currentProgress);
            }
        }, 200);
    }
    
    /**
     * 停止模拟进度更新
     */
    function stopProgressSimulation() {
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }

    /**
     * 根据主题和数量创建提示词
     * @param {string} topics - 主题字符串
     * @param {number} num - 题目数量
     * @param {number} difficulty - 难度级别 (1-10)
     * @returns {string} - 生成的提示词
     */
    function createPrompt(topics, num, difficulty = 5) {
        // 根据难度级别设置题目要求
        const difficultyInfo = getDifficultyInfo(difficulty);
        let difficultyGuidance = '';
        
        if (difficulty <= 2) {
            difficultyGuidance = `题目难度为${difficulty}级（${difficultyInfo.desc}），请生成基础概念题目，主要考查基本定义、简单理解和记忆性知识点。题目应该直观明了，答案相对明确。`;
        } else if (difficulty <= 4) {
            difficultyGuidance = `题目难度为${difficulty}级（${difficultyInfo.desc}），请生成初中级题目，考查基础知识的理解和简单应用，可以包含一些基本的分析和判断。`;
        } else if (difficulty <= 6) {
            difficultyGuidance = `题目难度为${difficulty}级（${difficultyInfo.desc}），请生成中等难度题目，考查知识点的综合运用和分析能力，包含常见的实际应用场景。`;
        } else if (difficulty <= 8) {
            difficultyGuidance = `题目难度为${difficulty}级（${difficultyInfo.desc}），请生成中高级题目，考查深层次理解、复杂场景分析和解决方案设计，需要较强的技术功底。`;
        } else {
            difficultyGuidance = `题目难度为${difficulty}级（${difficultyInfo.desc}），请生成高级/专家级题目，考查系统性思维、架构设计能力和前沿技术理解，适合资深技术专家。`;
        }
        
        // 根据主题类型添加不同的提示语
        let topicGuidance = '';
        if (topics.includes('Java') || topics.includes('java')) {
            topicGuidance += "对于Java相关题目，请涵盖核心概念、语法特性、多线程、集合框架和JVM等方面。";
        }
        if (topics.includes('数据库') || topics.includes('MySQL') || topics.includes('Redis')) {
            topicGuidance += "对于数据库相关题目，请涵盖SQL语法、索引原理、事务特性、锁机制和性能优化等方面。";
        }
        if (topics.includes('框架') || topics.includes('Spring') || topics.includes('SpringBoot')) {
            topicGuidance += "对于框架相关题目，请涵盖依赖注入、AOP、事务管理、注解和配置等方面。";
        }
        if (topics.includes('中间件') || topics.includes('Kafka') || topics.includes('RabbitMQ') || topics.includes('Nacos')) {
            topicGuidance += "对于中间件相关题目，请涵盖架构原理、消息队列特性、配置中心和服务发现等方面。";
        }

        const exampleQuestions = [
          {
            "question": "关于 Java 中的 `String`，以下哪个说法是正确的？",
            "type": "single",
            "options": [
              "String 是基本数据类型。",
              "String 的值是不可变的。",
              "可以使用 `==` 比较两个 String 对象的内容是否相等。",
              "String 存放在堆内存中。"
            ],
            "answer": "B",
            "explanation": "String 在 Java 中是一个对象，其值一旦创建就不能被改变（不可变性）。`==` 比较的是对象的引用地址，比较内容应使用 `.equals()` 方法。字符串常量池在方法区或堆中（取决于JDK版本）。"
          },
          {
            "question": "在 Spring Boot 中，哪些注解常用于依赖注入？",
            "type": "multiple",
            "options": [
              "@Autowired",
              "@Resource",
              "@Inject",
              "@Component"
            ],
            "answer": ["A", "B", "C"],
            "explanation": "@Autowired, @Resource, @Inject 都是用于依赖注入的注解。@Component 用于声明一个类为 Spring Bean，但它本身不直接执行注入操作。"
          },
          {
            "question": "MySQL 的 InnoDB 存储引擎支持事务。",
            "type": "truefalse",
            "options": ["正确", "错误"],
            "answer": "A",
            "explanation": "InnoDB 是 MySQL 的一个事务性存储引擎，支持ACID特性。MyISAM 存储引擎则不支持事务。"
          }
        ];

        const exampleJson = JSON.stringify(exampleQuestions, null, 2);

        return `
您是一个资深的Java技术面试官。请根据以下要求，为我生成一份技术知识模拟考试试卷。

要求：
1.  **主题范围**：${topics}
2.  **题目数量**：${num}
3.  **题目类型**：混合包含单选题、多选题和判断题。
4.  **难度要求**：${difficultyGuidance}
5.  **特别提示**：${topicGuidance}
6.  **多样性要求**：请确保每道题目都不同，避免生成重复或相似的题目。题目应涵盖不同的知识点和应用场景。
7.  **题目分布**：建议${Math.ceil(num * 0.6)}道单选题、${Math.ceil(num * 0.25)}道多选题、${Math.floor(num * 0.15)}道判断题，具体可根据主题适当调整。
8.  **输出格式**：必须严格按照下面的 JSON 格式返回一个 JSON 数组，数组中的每个对象代表一道题。不要在JSON代码块前后添加任何额外的解释或文本。

**JSON 输出格式示例**:
\`\`\`json
${exampleJson}
\`\`\`
`;
    }

    /**
     * 为自定义题库创建提示词
     * @param {number} num - 题目数量
     * @param {string} databaseContent - 自定义题库内容
     * @param {number} difficulty - 难度级别 (1-10)
     * @returns {string} - 生成的提示词
     */
    function createCustomDatabasePrompt(num, databaseContent, difficulty = 5) {
        // 根据难度级别设置题目要求
        const difficultyInfo = getDifficultyInfo(difficulty);
        let difficultyGuidance = '';
        
        if (difficulty <= 2) {
            difficultyGuidance = `题目难度为${difficulty}级（${difficultyInfo.desc}），请基于题库内容生成基础概念题目，主要考查基本定义、简单理解和记忆性知识点。`;
        } else if (difficulty <= 4) {
            difficultyGuidance = `题目难度为${difficulty}级（${difficultyInfo.desc}），请基于题库内容生成初中级题目，考查基础知识的理解和简单应用。`;
        } else if (difficulty <= 6) {
            difficultyGuidance = `题目难度为${difficulty}级（${difficultyInfo.desc}），请基于题库内容生成中等难度题目，考查知识点的综合运用和分析能力。`;
        } else if (difficulty <= 8) {
            difficultyGuidance = `题目难度为${difficulty}级（${difficultyInfo.desc}），请基于题库内容生成中高级题目，考查深层次理解和复杂场景分析。`;
        } else {
            difficultyGuidance = `题目难度为${difficulty}级（${difficultyInfo.desc}），请基于题库内容生成高级/专家级题目，考查系统性思维和架构设计能力。`;
        }
        const exampleQuestions = [
          {
            "question": "关于 Java 中的 `String`，以下哪个说法是正确的？",
            "type": "single",
            "options": [
              "String 是基本数据类型。",
              "String 的值是不可变的。",
              "可以使用 `==` 比较两个 String 对象的内容是否相等。",
              "String 存放在堆内存中。"
            ],
            "answer": "B",
            "explanation": "String 在 Java 中是一个对象，其值一旦创建就不能被改变（不可变性）。`==` 比较的是对象的引用地址，比较内容应使用 `.equals()` 方法。字符串常量池在方法区或堆中（取决于JDK版本）。"
          },
          {
            "question": "在 Spring Boot 中，哪些注解常用于依赖注入？",
            "type": "multiple",
            "options": [
              "@Autowired",
              "@Resource",
              "@Inject",
              "@Component"
            ],
            "answer": ["A", "B", "C"],
            "explanation": "@Autowired, @Resource, @Inject 都是用于依赖注入的注解。@Component 用于声明一个类为 Spring Bean，但它本身不直接执行注入操作。"
          }
        ];

        const exampleJson = JSON.stringify(exampleQuestions, null, 2);
        
        // 限制自定义题库内容长度，避免超出模型上下文
        const maxContentLength = 10000;
        let limitedContent = databaseContent;
        if (databaseContent.length > maxContentLength) {
            limitedContent = databaseContent.substring(0, maxContentLength) + 
                `\n...(内容已截断，原文共${databaseContent.length}字符)`;
        }

        return `
您是一个资深的技术面试官。请根据以下要求，为我生成一份技术知识模拟考试试卷。

要求：
1.  **题目来源**：请仔细阅读下面的自定义题库内容，并完全基于这些内容出题。
2.  **题目数量**：${num}
3.  **题目类型**：混合包含单选题、多选题和判断题。
4.  **难度要求**：${difficultyGuidance}
5.  **重要提示**：题目必须与自定义题库内容紧密相关，不要生成与题库无关的内容。
6.  **多样性要求**：请确保每道题目都不同，避免生成重复或相似的题目。应从题库内容的不同部分和角度出题，覆盖各种知识点。
7.  **题目分布**：建议${Math.ceil(num * 0.6)}道单选题、${Math.ceil(num * 0.25)}道多选题、${Math.floor(num * 0.15)}道判断题，具体可根据题库内容适当调整。
8.  **输出格式**：必须严格按照下面的 JSON 格式返回一个 JSON 数组，数组中的每个对象代表一道题。不要在JSON代码块前后添加任何额外的解释或文本。

**自定义题库内容**:
\`\`\`
${limitedContent}
\`\`\`

**JSON 输出格式示例**:
\`\`\`json
${exampleJson}
\`\`\`
`;
    }



    /**
     * 调用大模型 API (支持流式输出)
     * @param {string} prompt - 发送给模型的提示词
     * @param {boolean} stream - 是否使用流式输出
     * @returns {Promise<string|ReadableStream>} - 模型返回的响应
     */
    async function callLLM(prompt, stream = false) {
        console.log('开始调用大模型API...', stream ? '(流式输出)' : '(标准输出)');
        const url = "https://api.deepseek.com/chat/completions";
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        };
        const body = JSON.stringify({
            model: "deepseek-chat",
            messages: [
                { "role": "system", "content": "You are a helpful assistant that generates technical quizzes." },
                { "role": "user", "content": prompt }
            ],
            stream: stream
        });

        console.log('API请求参数已准备好，开始发送请求...');
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body
            });

            console.log('API请求已发送，状态码:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(e => ({ error: { message: '无法解析API错误响应' } }));
                console.error('API请求失败:', errorData);
                throw new Error(`API 请求失败: ${response.status} ${response.statusText} - ${errorData.error?.message || '未知错误'}`);
            }

            if (stream) {
                return response;
            } else {
                const data = await response.json();
                console.log('API响应成功解析');
                return data.choices[0].message.content;
            }
        } catch (error) {
            console.error('API调用过程中发生错误:', error);
            throw error;
        }
    }
    
    /**
     * 解析LLM返回的JSON字符串
     * @param {string} responseText - LLM返回的包含JSON的字符串
     * @returns {Array|null} - 解析后的问题数组，如果解析失败则返回null
     */
    function parseLLMResponse(responseText) {
        console.log('开始解析大模型响应...');
        try {
            // 策略1：尝试从Markdown代码块中提取JSON
            const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            console.log('JSON代码块匹配结果:', jsonMatch ? '找到代码块' : '未找到代码块');
            
            let jsonString = '';
            if (jsonMatch) {
                // 找到代码块，使用代码块内容
                jsonString = jsonMatch[1];
            } else {
                // 没找到代码块，尝试直接解析整个响应
                jsonString = responseText;
            }
            
            // 清理和规范化JSON字符串
            jsonString = jsonString.trim()
                .replace(/^[\s\n]*\[/, '[')  // 确保开头是干净的 [
                .replace(/\][\s\n]*$/, ']') // 确保结尾是干净的 ]
                .replace(/,\s*]/g, ']')     // 移除尾随逗号
                .replace(/,\s*}/g, '}');    // 移除对象末尾的逗号
            
            console.log('尝试解析JSON...');
            console.log('清理后的JSON字符串长度:', jsonString.length);
            
            const parsedData = JSON.parse(jsonString);
            
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log(`成功解析 ${parsedData.length} 道题目`);
                return parsedData;
            } else {
                console.error('解析结果不是有效的题目数组');
                return null;
            }
        } catch (error) {
            console.error("JSON 解析失败:", error);
            console.error("原始响应文本:", responseText.substring(0, 500) + '...');
            
            // 策略2：尝试部分解析 - 提取所有完整的JSON对象
            try {
                console.log('尝试部分解析...');
                const partialQuestions = extractPartialQuestions(responseText);
                if (partialQuestions.length > 0) {
                    console.log(`部分解析成功，提取到 ${partialQuestions.length} 道题目`);
                    return partialQuestions;
                }
            } catch (partialError) {
                console.error('部分解析也失败:', partialError);
            }
            
            return null;
        }
    }

    /**
     * 从响应文本中提取部分有效的题目
     * @param {string} responseText - 响应文本
     * @returns {Array} - 提取到的题目数组
     */
    function extractPartialQuestions(responseText) {
        const questions = [];
        
        // 使用正则表达式匹配所有可能的题目对象
        const questionPattern = /\{[^{}]*"question"[^{}]*\}/g;
        let match;
        
        while ((match = questionPattern.exec(responseText)) !== null) {
            try {
                const questionObj = JSON.parse(match[0]);
                if (isQuestionComplete(questionObj)) {
                    questions.push(questionObj);
                }
            } catch (e) {
                // 忽略单个题目解析失败
                console.warn('单个题目解析失败:', match[0].substring(0, 100));
            }
        }
        
        // 如果简单匹配失败，尝试更复杂的大括号匹配
        if (questions.length === 0) {
            const complexQuestions = parseWithBraceMatching(responseText);
            questions.push(...complexQuestions);
        }
        
        return questions;
    }

    /**
     * 使用大括号匹配算法提取题目
     * @param {string} text - 文本内容
     * @returns {Array} - 提取到的题目数组
     */
    function parseWithBraceMatching(text) {
        const questions = [];
        let braceCount = 0;
        let startIndex = -1;
        
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '{') {
                if (braceCount === 0) {
                    startIndex = i;
                }
                braceCount++;
            } else if (text[i] === '}') {
                if (braceCount > 0) {
                    braceCount--;
                    if (braceCount === 0 && startIndex !== -1) {
                        const objectStr = text.substring(startIndex, i + 1);
                        try {
                            const obj = JSON.parse(objectStr);
                            if (obj.question && isQuestionComplete(obj)) {
                                questions.push(obj);
                            }
                        } catch (e) {
                            // 忽略解析失败的对象
                        }
                        startIndex = -1;
                    }
                }
            }
        }
        
        return questions;
    }

    /**
     * 流式生成整个考试
     * @param {string} prompt - 完整的考试生成提示词
     * @param {number} totalQuestions - 总题目数量
     */
    async function generateExamWithStream(prompt, totalQuestions) {
        console.log('开始流式生成整个考试...');
        
        // 调用流式API
        const response = await callLLM(prompt, true);
        
        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';
        let receivedBytes = 0;
        const expectedMinBytes = totalQuestions * 500; // 估算每题至少500字节
        
        try {
            updateProgress('正在连接流式API...', 10, true);
            addGenerationLog('📡 题库确认完成，开始生成...', 'info');
            
            let lastQuestionCount = 0;
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            break;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices?.[0]?.delta?.content;
                            if (delta) {
                                content += delta;
                                receivedBytes += delta.length;
                                
                                // 根据接收到的数据量更新进度条 (10%-80%)
                                const progress = Math.min(80, 10 + (receivedBytes / expectedMinBytes) * 70);
                                updateProgress('正在生成题目...', progress, true);
                                
                                // 尝试解析已接收的内容，看是否有完整的题目
                                const beforeCount = currentExam.questions.length;
                                tryParseAndRenderQuestions(content, totalQuestions);
                                const afterCount = currentExam.questions.length;
                                
                                // 如果有新题目生成，添加开始生成日志
                                if (afterCount > lastQuestionCount) {
                                    for (let i = lastQuestionCount; i < afterCount; i++) {
                                        addGenerationLog(`📝 开始生成第 ${i + 1} 道题目`, 'info');
                                    }
                                    lastQuestionCount = afterCount;
                                }
                                
                                // 强制更新视图
                                if (realtimeQuestionsContainer) {
                                    realtimeQuestionsContainer.style.display = 'block';
                                }
                            }
                        } catch (e) {
                            // 忽略解析错误，继续处理
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
        
        console.log('流式数据接收完成，开始最终解析...');
        addGenerationLog('📋 数据接收完成，正在整理题目...', 'info');
        updateProgress('正在整理题目...', 85, false);
        
        // 最终解析所有题目
        const parsedQuestions = parseLLMResponse(content);
        console.log('解析结果:', parsedQuestions ? `成功解析 ${parsedQuestions.length} 道题目` : '解析失败');
        
        if (parsedQuestions && parsedQuestions.length > 0) {
            addGenerationLog(`✅ 成功解析 ${parsedQuestions.length} 道题目`, 'success');
        } else {
            addGenerationLog('❌ 题目解析失败', 'error');
        }
        
        if (!parsedQuestions || parsedQuestions.length === 0) {
            throw new Error("模型未能返回有效格式的题目，请检查API Key或稍后重试。");
        }
        
        // 渲染所有尚未渲染的完整题目
        let renderedCount = 0;
        let skippedCount = 0;
        
        for (let i = currentExam.questions.length; i < parsedQuestions.length; i++) {
            const question = parsedQuestions[i];
            
            // 验证题目完整性
            if (isQuestionComplete(question)) {
                currentExam.questions.push(question);
                currentExam.userAnswers.push(null);
                
                const renderSuccess = renderSingleQuestion(question, currentExam.questions.length - 1);
                if (renderSuccess) {
                    renderedCount++;
                    
                    // 同时在遮罩层显示实时题目（如果之前没有显示过）
                    renderRealtimeQuestion(question, currentExam.questions.length - 1);
                    
                    // 添加最终渲染日志
                    const questionType = question.type === 'single' ? '单选题' : 
                                       question.type === 'multiple' ? '多选题' : 
                                       question.type === 'judgment' || question.type === 'truefalse' ? '判断题' : '未知类型';
                    addGenerationLog(`✓ 第 ${renderedCount} 道题目最终渲染完成 (${questionType})`, 'success');
                    
                    // 实时更新进度 (85%-95%)
                    const progress = 85 + (renderedCount / Math.min(parsedQuestions.length, totalQuestions)) * 10;
                    updateProgress(`正在显示第 ${renderedCount} 道题目...`, progress, false);
                    
                    // 短暂延迟，让用户看到题目逐个出现
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            } else {
                skippedCount++;
                console.warn(`跳过格式不正确的题目 ${i + 1}:`, question);
            }
        }
        
        console.log(`最终渲染完成: 成功 ${renderedCount} 道题目，跳过 ${skippedCount} 道题目`);
        addGenerationLog(`渲染完成: 成功 ${renderedCount} 道，跳过 ${skippedCount} 道`, 'info');
        
        // 如果没有成功渲染任何题目，抛出错误
        if (currentExam.questions.length === 0) {
            addGenerationLog('❌ 所有题目都解析失败，无法生成考试', 'error');
            throw new Error("所有题目都解析失败，无法生成考试");
        }
        
        // 如果成功题目少于预期，给出提示但不中断流程
        if (currentExam.questions.length < totalQuestions) {
            console.warn(`注意：预期生成 ${totalQuestions} 道题目，实际成功生成 ${currentExam.questions.length} 道题目`);
            addGenerationLog(`⚠ 预期 ${totalQuestions} 道题目，实际生成 ${currentExam.questions.length} 道`, 'warning');
            updateProgress(`考试生成完成（${currentExam.questions.length}/${totalQuestions}道题目）`, 95, false);
        }
        
        console.log('所有题目渲染完成');
    }

    /**
     * 尝试解析并渲染已接收的题目
     * @param {string} content - 当前接收到的内容
     * @param {number} totalQuestions - 总题目数量
     */
    function tryParseAndRenderQuestions(content, totalQuestions) {
        console.log('🔍 [DEBUG] tryParseAndRenderQuestions 被调用');
        console.log('🔍 [DEBUG] 当前内容长度:', content.length);
        console.log('🔍 [DEBUG] 当前已有题目数量:', currentExam.questions.length);
        
        try {
            // 检查是否包含JSON代码块
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (!jsonMatch) {
                console.log('🔍 [DEBUG] 未找到JSON代码块');
                // 尝试直接解析内容（可能没有代码块标记）
                if (content.includes('{') && content.includes('"question"')) {
                    console.log('🔍 [DEBUG] 发现可能的题目数据，尝试直接解析');
                    tryDirectParse(content, totalQuestions);
                }
                return;
            }

            let jsonString = jsonMatch[1].trim();
            console.log('🔍 [DEBUG] 提取的JSON字符串长度:', jsonString.length);
            console.log('🔍 [DEBUG] JSON前200字符:', jsonString.substring(0, 200));

            // 移除开头的 [ 如果存在
            if (jsonString.startsWith('[')) {
                jsonString = jsonString.substring(1);
                console.log('🔍 [DEBUG] 移除开头的 [');
            }

            // 尝试多种解析策略
            let parsedQuestions = [];
            
            // 策略1: 直接尝试解析完整数组
            if (jsonString.includes(']')) {
                try {
                    const fullArray = JSON.parse('[' + jsonString);
                    if (Array.isArray(fullArray)) {
                        parsedQuestions = fullArray;
                        console.log('🔍 [DEBUG] 策略1成功: 解析完整数组，得到', parsedQuestions.length, '道题目');
                    }
                } catch (e) {
                    console.log('🔍 [DEBUG] 策略1失败:', e.message);
                }
            }
            
            // 策略2: 如果策略1失败，使用大括号计数法
            if (parsedQuestions.length === 0) {
                console.log('🔍 [DEBUG] 尝试策略2: 大括号计数法');
                parsedQuestions = parseWithBraceCount(jsonString);
                console.log('🔍 [DEBUG] 策略2结果: 找到', parsedQuestions.length, '道题目');
            }

            // 策略3: 如果还是没有，尝试按逗号分割
            if (parsedQuestions.length === 0) {
                console.log('🔍 [DEBUG] 尝试策略3: 逗号分割法');
                parsedQuestions = parseWithCommaSplit(jsonString);
                console.log('🔍 [DEBUG] 策略3结果: 找到', parsedQuestions.length, '道题目');
            }

            // 检查是否有新题目需要渲染
            const newQuestionsCount = parsedQuestions.length - currentExam.questions.length;
            if (newQuestionsCount <= 0) {
                console.log('🔍 [DEBUG] 没有新题目需要渲染');
                return;
            }

            console.log('🔍 [DEBUG] 发现', newQuestionsCount, '道新题目，开始渲染');
            addGenerationLog(`📝 发现 ${newQuestionsCount} 道新题目，开始渲染`, 'info');

            // 渲染新题目
            let successCount = 0;
            for (let i = currentExam.questions.length; i < parsedQuestions.length; i++) {
                const question = parsedQuestions[i];
                console.log('🔍 [DEBUG] 处理第', i + 1, '道题目:', question.question?.substring(0, 50));

                if (isQuestionComplete(question)) {
                    currentExam.questions.push(question);
                    currentExam.userAnswers.push(null);

                    console.log('🔍 [DEBUG] 开始渲染到弹窗，题目索引:', i);
                    
                    // 立即渲染到弹窗
                    try {
                        renderRealtimeQuestion(question, i);
                        console.log('🔍 [DEBUG] 弹窗渲染成功，题目:', i + 1);
                        successCount++;
                    } catch (e) {
                        console.error('🔍 [DEBUG] 弹窗渲染失败:', e);
                    }

                    // 渲染到主页面
                    try {
                        renderSingleQuestion(question, i);
                        console.log('🔍 [DEBUG] 主页面渲染成功，题目:', i + 1);
                    } catch (e) {
                        console.error('🔍 [DEBUG] 主页面渲染失败:', e);
                    }

                    const questionType = question.type === 'single' ? '单选题' :
                        question.type === 'multiple' ? '多选题' :
                        question.type === 'judgment' || question.type === 'truefalse' ? '判断题' : '未知类型';
                                            addGenerationLog(`✅ 第 ${i + 1} 道题目生成完成`, 'success');
                } else {
                    console.log('🔍 [DEBUG] 题目不完整，跳过:', question);
                    addGenerationLog(`⚠ 跳过不完整的题目 ${i + 1}`, 'warning');
                }
            }

            console.log('🔍 [DEBUG] 本次渲染完成，成功:', successCount, '道题目');
        } catch (e) {
            console.error('🔍 [DEBUG] tryParseAndRenderQuestions 发生错误:', e);
        }
    }

    // 大括号计数解析函数
    function parseWithBraceCount(jsonString) {
        const parsedData = [];
        let braceCount = 0;
        let objectStartIndex = -1;

        for (let i = 0; i < jsonString.length; i++) {
            if (jsonString[i] === '{') {
                if (braceCount === 0) {
                    objectStartIndex = i;
                }
                braceCount++;
            } else if (jsonString[i] === '}') {
                if (braceCount > 0) {
                    braceCount--;
                    if (braceCount === 0 && objectStartIndex !== -1) {
                        const objString = jsonString.substring(objectStartIndex, i + 1);
                        try {
                            const q = JSON.parse(objString);
                            if (q && q.question) {
                                parsedData.push(q);
                                console.log('🔍 [DEBUG] 大括号法解析成功:', q.question.substring(0, 30));
                            }
                        } catch (e) {
                            console.log('🔍 [DEBUG] 大括号法单个对象解析失败:', objString.substring(0, 50));
                        }
                        objectStartIndex = -1;
                    }
                }
            }
        }
        return parsedData;
    }

    // 逗号分割解析函数
    function parseWithCommaSplit(jsonString) {
        const parsedData = [];
        // 按 },{ 分割
        const parts = jsonString.split(/\},\s*\{/);
        
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i].trim();
            
            // 添加缺失的大括号
            if (i === 0 && !part.startsWith('{')) {
                part = '{' + part;
            }
            if (i === parts.length - 1 && !part.endsWith('}')) {
                part = part + '}';
            }
            if (i > 0 && i < parts.length - 1) {
                part = '{' + part + '}';
            }
            
            try {
                const q = JSON.parse(part);
                if (q && q.question) {
                    parsedData.push(q);
                    console.log('🔍 [DEBUG] 逗号分割法解析成功:', q.question.substring(0, 30));
                }
            } catch (e) {
                console.log('🔍 [DEBUG] 逗号分割法解析失败:', part.substring(0, 50));
            }
        }
        
        return parsedData;
    }

    // 直接解析函数（无代码块）
    function tryDirectParse(content, totalQuestions) {
        console.log('🔍 [DEBUG] 尝试直接解析内容');
        
        // 查找所有可能的JSON对象
        const matches = content.match(/\{[^{}]*"question"[^{}]*\}/g);
        if (matches) {
            console.log('🔍 [DEBUG] 直接解析找到', matches.length, '个可能的对象');
            
            for (const match of matches) {
                try {
                    const q = JSON.parse(match);
                    if (q && q.question && !currentExam.questions.some(existing => existing.question === q.question)) {
                        currentExam.questions.push(q);
                        currentExam.userAnswers.push(null);
                        const index = currentExam.questions.length - 1;
                        
                        renderRealtimeQuestion(q, index);
                        renderSingleQuestion(q, index);
                        
                        console.log('🔍 [DEBUG] 直接解析成功渲染题目:', index + 1);
                    }
                } catch (e) {
                    console.log('🔍 [DEBUG] 直接解析失败:', match.substring(0, 50));
                }
            }
        }
    }



    /**
     * 锁定或解锁页面交互
     * @param {boolean} lock - true为锁定，false为解锁
     */
    function lockPageInteraction(lock) {
        const elementsToLock = [
            // 侧边栏元素
            apiKeyInput,
            newExamBtn,
            clearHistoryBtn,
            
            // 主要设置区域元素
            sourceModelRadio,
            sourceCustomRadio,
            sourcePasteRadio,
            customDatabaseFile,
            selectFileBtn,
            pasteContentArea,
            editPreviewBtn,
            reUploadBtn,
            saveEditBtn,
            cancelEditBtn,
            numQuestionsInput,
            examDifficultyInput,
            customTopicInput,
            addCustomTopicBtn,
            generateExamBtn,
            
            // 考试区域元素
            submitExamBtn,
            
            // 结果区域元素
            exportPdfBtn
        ];

        // 锁定/解锁指定元素
        elementsToLock.forEach(element => {
            if (element) {
                element.disabled = lock;
                if (lock) {
                    element.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    element.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        });

        // 锁定/解锁知识点选择复选框
        const checkboxes = document.querySelectorAll('.child-topic, .parent-topic');
        checkboxes.forEach(checkbox => {
            checkbox.disabled = lock;
            if (lock) {
                checkbox.closest('div').classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                checkbox.closest('div').classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });

        // 锁定/解锁自定义知识点删除按钮
        const customTopicBtns = document.querySelectorAll('#customTopicsList button');
        customTopicBtns.forEach(btn => {
            btn.disabled = lock;
            if (lock) {
                btn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });

        // 锁定/解锁历史记录项的点击
        const historyItems = document.querySelectorAll('#historyList .exam-item');
        historyItems.forEach(item => {
            if (lock) {
                item.classList.add('pointer-events-none', 'opacity-50');
            } else {
                item.classList.remove('pointer-events-none', 'opacity-50');
            }
        });

        // 锁定/解锁侧边栏切换按钮
        if (toggleSidebarBtn) {
            toggleSidebarBtn.disabled = lock;
            if (lock) {
                toggleSidebarBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                toggleSidebarBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }

        console.log(`页面交互已${lock ? '锁定' : '解锁'}`);
    }

    /**
     * 验证题目对象是否完整
     * @param {object} question - 题目对象
     * @returns {boolean} - 是否完整
     */
    function isQuestionComplete(question) {
        // 基本结构检查
        if (!question || typeof question !== 'object') {
            console.warn('题目不是有效对象:', question);
            return false;
        }
        
        // 题目文本检查
        if (typeof question.question !== 'string' || question.question.trim().length === 0) {
            console.warn('题目文本缺失或格式错误:', question);
            return false;
        }
        
        // 题目类型检查
        const validTypes = ['single', 'multiple', 'truefalse', 'judgment'];
        if (!validTypes.includes(question.type)) {
            console.warn('题目类型无效:', question.type, '有效类型:', validTypes);
            return false;
        }
        
        // 答案检查
        if (question.answer === undefined || question.answer === null || question.answer === '') {
            console.warn('题目答案缺失:', question);
            return false;
        }
        
        // 判断题特殊处理
        if (question.type === 'judgment' || question.type === 'truefalse') {
            // 判断题答案应该是A或B
            const validAnswers = ['A', 'B'];
            if (!validAnswers.includes(question.answer)) {
                console.warn('判断题答案格式错误，应为A或B:', question.answer);
                return false;
            }
            return true; // 判断题不需要options字段
        }
        
        // 单选和多选题需要options
        if (!Array.isArray(question.options) || question.options.length === 0) {
            console.warn('选择题选项缺失或格式错误:', question.options);
            return false;
        }
        
        // 检查选项内容
        for (let i = 0; i < question.options.length; i++) {
            if (typeof question.options[i] !== 'string' || question.options[i].trim().length === 0) {
                console.warn(`选项 ${i + 1} 内容无效:`, question.options[i]);
                return false;
            }
        }
        
        // 答案格式检查
        if (question.type === 'single') {
            // 单选题答案应该是单个字母
            const expectedAnswers = question.options.map((_, i) => String.fromCharCode(65 + i));
            if (!expectedAnswers.includes(question.answer)) {
                console.warn('单选题答案格式错误:', question.answer, '期望:', expectedAnswers);
                return false;
            }
        } else if (question.type === 'multiple') {
            // 多选题答案应该是字母数组
            if (!Array.isArray(question.answer) || question.answer.length === 0) {
                console.warn('多选题答案应为非空数组:', question.answer);
                return false;
            }
            
            const expectedAnswers = question.options.map((_, i) => String.fromCharCode(65 + i));
            for (const ans of question.answer) {
                if (!expectedAnswers.includes(ans)) {
                    console.warn('多选题答案中包含无效选项:', ans, '期望:', expectedAnswers);
                    return false;
                }
            }
        }
        
        // 解析字段检查（可选，但建议有）
        if (question.explanation && typeof question.explanation !== 'string') {
            console.warn('题目解析格式错误，应为字符串:', question.explanation);
            // 解析字段错误不影响题目完整性，只是警告
        }
        
        return true;
    }

    /**
     * 安全渲染单道题目到页面
     * @param {object} question - 题目对象
     * @param {number} index - 题目索引
     * @returns {boolean} - 是否成功渲染
     */
    function renderSingleQuestion(question, index) {
        try {
            // 验证题目完整性
            if (!isQuestionComplete(question)) {
                console.warn(`题目 ${index + 1} 数据不完整，跳过渲染:`, question);
                return false;
            }

            const questionEl = document.createElement('div');
            questionEl.classList.add('mb-6', 'p-4', 'border-b', 'question-item');
            questionEl.style.opacity = '0';
            questionEl.style.transform = 'translateY(20px)';
            
            const questionHtml = `
                <p class="font-semibold mb-2">${index + 1}. ${question.question}</p>
                <div class="options-container space-y-2">
                    ${renderOptions(question, index)}
                </div>
            `;

            questionEl.innerHTML = questionHtml;
            questionsContainer.appendChild(questionEl);
            
            // 添加淡入动画
            setTimeout(() => {
                questionEl.style.transition = 'all 0.5s ease';
                questionEl.style.opacity = '1';
                questionEl.style.transform = 'translateY(0)';
            }, 100);
            
            console.log(`题目 ${index + 1} 渲染完成`);
            return true;
        } catch (error) {
            console.error(`渲染题目 ${index + 1} 时发生错误:`, error, question);
            return false;
        }
    }

    /**
     * 渲染当前考试的题目
     * @param {object} exam - 当前的考试对象
     */
    function renderExam(exam) {
        // 安全检查
        if (!exam || !exam.questions || !Array.isArray(exam.questions)) {
            console.error('renderExam: 考试数据不完整');
            questionsContainer.innerHTML = '<div class="text-red-500 p-4">考试数据错误，无法显示题目</div>';
            return;
        }
        
        const examTitle = exam.title || '未命名考试';
        examTitle && (document.getElementById('exam-title').textContent = examTitle);
        questionsContainer.innerHTML = '';

        exam.questions.forEach((q, index) => {
            // 对每个题目进行安全检查
            if (!q || typeof q.question !== 'string') {
                console.warn(`题目 ${index + 1} 数据不完整，跳过渲染`);
                const errorEl = document.createElement('div');
                errorEl.className = 'mb-6 p-4 border border-red-300 rounded-lg bg-red-50';
                errorEl.innerHTML = `
                    <p class="font-semibold mb-2 text-red-700">${index + 1}. 题目解析失败</p>
                    <p class="text-red-600 text-sm">该题目数据不完整，无法正常显示</p>
                `;
                questionsContainer.appendChild(errorEl);
                return;
            }
            
            const questionEl = document.createElement('div');
            questionEl.classList.add('mb-6', 'p-4', 'border-b');
            
            try {
                questionEl.innerHTML = `
                    <p class="font-semibold mb-2">${index + 1}. ${q.question}</p>
                    <div class="options-container space-y-2">
                        ${renderOptions(q, index)}
                    </div>
                `;
                questionsContainer.appendChild(questionEl);
            } catch (error) {
                console.error(`渲染题目 ${index + 1} 时发生错误:`, error);
                questionEl.innerHTML = `
                    <p class="font-semibold mb-2 text-red-700">${index + 1}. 题目渲染失败</p>
                    <p class="text-red-600 text-sm">该题目在渲染过程中发生错误</p>
                `;
                questionsContainer.appendChild(questionEl);
            }
        });
        
        // 为所有选项添加变化监听器，实时保存答案
        const allInputs = questionsContainer.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        allInputs.forEach(input => {
            input.addEventListener('change', () => {
                saveCurrentAnswers();
            });
        });
    }

    /**
     * 实时保存当前答案
     */
    function saveCurrentAnswers() {
        if (!currentExam) return;
        
        // 收集当前答案
        currentExam.questions.forEach((q, index) => {
            const name = `question-${index}`;
            const inputs = document.querySelectorAll(`input[name="${name}"]:checked`);
            
            if (inputs.length > 0) {
                if (q.type === 'multiple') {
                    currentExam.userAnswers[index] = Array.from(inputs).map(input => input.value);
                } else {
                    currentExam.userAnswers[index] = inputs[0].value;
                }
            } else {
                currentExam.userAnswers[index] = null;
            }
        });
        
        // 更新最后答题时间
        currentExam.lastAnswerTime = new Date().toISOString();
        
        // 更新历史记录中的数据
        const examIndex = examHistory.findIndex(exam => exam.id === currentExam.id);
        if (examIndex !== -1) {
            examHistory[examIndex] = currentExam;
            
            // 保存到本地存储
            try {
                localStorage.setItem('exam_history', JSON.stringify(examHistory));
            } catch (error) {
                console.error('保存答题进度失败:', error);
            }
        }
    }

    /**
     * 根据题目类型渲染选项
     * @param {object} question - 题目对象
     * @param {number} questionIndex - 题目索引
     * @returns {string} - 选项的 HTML 字符串
     */
    function renderOptions(question, questionIndex) {
        const name = `question-${questionIndex}`;
        
        // 处理判断题类型
        if (question.type === 'judgment' || question.type === 'truefalse') {
            return `
                <div class="mb-3 pl-2">
                    <input type="radio" id="${name}-option-0" name="${name}" value="A" class="mr-2">
                    <label for="${name}-option-0" class="select-none">A. 正确</label>
                </div>
                <div class="mb-3 pl-2">
                    <input type="radio" id="${name}-option-1" name="${name}" value="B" class="mr-2">
                    <label for="${name}-option-1" class="select-none">B. 错误</label>
                </div>
            `;
        }

        // 安全检查：确保其他类型题目有选项数据
        if (!question || !question.options || !Array.isArray(question.options)) {
            console.error('题目选项数据不完整:', question);
            return '<div class="text-red-500 p-2 border border-red-300 rounded bg-red-50">该题目选项数据缺失或格式错误，无法正常显示</div>';
        }

        const optionType = question.type === 'single' ? 'radio' : 'checkbox';

        return question.options.map((option, optionIndex) => {
            const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C...
            return `
                <div class="mb-3 pl-2">
                    <input type="${optionType}" id="${name}-option-${optionIndex}" name="${name}" value="${optionLetter}" class="mr-2">
                    <label for="${name}-option-${optionIndex}" class="select-none">${optionLetter}. ${option}</label>
                </div>
            `;
        }).join('');
    }

    /**
     * 提交试卷并计算分数
     */
    function submitExam() {
        console.log('开始提交试卷...');
        if (!currentExam) {
            console.log('没有当前考试数据，无法提交');
            return;
        }

        // 收集答案
        currentExam.questions.forEach((q, index) => {
            const name = `question-${index}`;
            const inputs = document.querySelectorAll(`input[name="${name}"]:checked`);
            
            if (inputs.length > 0) {
                if (q.type === 'multiple') {
                    currentExam.userAnswers[index] = Array.from(inputs).map(input => input.value);
                } else {
                    currentExam.userAnswers[index] = inputs[0].value;
                }
            }
        });

        // 计算分数
        let correctCount = 0;
        currentExam.questions.forEach((q, index) => {
            const userAnswer = currentExam.userAnswers[index];
            const correctAnswer = q.answer;

            if (JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)) {
                correctCount++;
            } else if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
                // 处理多选题答案顺序不一致但内容一致的情况
                if (userAnswer.length === correctAnswer.length && userAnswer.every(val => correctAnswer.includes(val))) {
                    correctCount++;
                }
            }
        });

        currentExam.score = Math.round((correctCount / currentExam.questions.length) * 100);
        currentExam.status = 'completed';
        currentExam.completedTime = new Date().toISOString();
        console.log(`考试得分: ${currentExam.score}`);
        
        // 更新历史记录中的考试状态（不需要重新添加，因为已经在历史记录中）
        let currentExamIndex = examHistory.findIndex(exam => exam.id === currentExam.id);
        if (currentExamIndex !== -1) {
            examHistory[currentExamIndex] = currentExam;
            console.log('已更新历史记录中的考试状态为已完成');
        } else {
            // 如果因为某种原因没找到，则添加到历史记录
            examHistory.unshift(currentExam);
            currentExamIndex = 0; // 添加到开头，索引为0
            console.log('考试未在历史记录中找到，已重新添加');
        }
        
        // 安全地保存数据
        try {
            localStorage.setItem('exam_history', JSON.stringify(examHistory));
            console.log('考试记录已保存到本地存储');
        } catch (error) {
            console.error('保存考试记录失败:', error);
            alert('保存考试记录失败，可能是由于浏览器存储空间不足。');
        }

        // 显示结果 - 显示刚刚提交的考试（使用正确的索引）
        renderHistoryList();
        console.log(`准备显示考试结果 - 考试标题: "${currentExam.title}", 得分: ${currentExam.score}, 历史记录索引: ${currentExamIndex}`);
        showExamResult(currentExamIndex); // 显示刚刚完成的考试，使用正确的索引
    }

    /**
     * 渲染结果页面
     * @param {Array} questions - 问题数组
     * @param {Array} userAnswers - 用户答案数组
     */
    function renderResults(questions, userAnswers) {
        resultQuestionsContainer.innerHTML = '';
        
        // 安全检查：确保传入的参数是有效数组
        if (!Array.isArray(questions) || !Array.isArray(userAnswers)) {
            console.error('renderResults: 传入的参数不是有效数组');
            resultQuestionsContainer.innerHTML = '<div class="text-red-500 p-4">题目数据错误，无法显示结果</div>';
            return;
        }
        
        // 如果是自定义题库，显示题库文件名
        if (currentExam && currentExam.isCustomDatabase && currentExam.customDbName) {
            const dbInfoDiv = document.createElement('div');
            dbInfoDiv.className = 'mb-4 p-2 bg-blue-50 text-blue-700 rounded';
            dbInfoDiv.innerHTML = `<p class="text-sm"><strong>题库来源:</strong> ${currentExam.customDbName}</p>`;
            resultQuestionsContainer.appendChild(dbInfoDiv);
        }
        
        questions.forEach((q, index) => {
            // 安全检查：确保题目对象存在且有基本属性
            if (!q || typeof q.question !== 'string') {
                console.warn(`题目 ${index + 1} 数据不完整，跳过显示`);
                const errorEl = document.createElement('div');
                errorEl.className = 'mb-6 p-4 border border-red-300 rounded-lg bg-red-50';
                errorEl.innerHTML = `
                    <p class="font-semibold mb-2 text-red-700">${index + 1}. 题目解析失败</p>
                    <p class="text-red-600 text-sm">该题目数据不完整，无法正常显示</p>
                `;
                resultQuestionsContainer.appendChild(errorEl);
                return;
            }
            
            const userAnswer = userAnswers[index];
            const correctAnswer = q.answer;
            const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer) || 
                (Array.isArray(correctAnswer) && Array.isArray(userAnswer) && 
                 userAnswer.length === correctAnswer.length && 
                 userAnswer.every(val => correctAnswer.includes(val)));
            
            const resultEl = document.createElement('div');
            resultEl.classList.add('mb-6', 'p-4', 'border', 'rounded-lg', isCorrect ? 'border-green-300' : 'border-red-300');
            
            let userAnswerText = '未作答';
            if (userAnswer) {
                userAnswerText = Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer;
            }
            const correctAnswerText = Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer;

            // 安全地渲染选项 - 处理判断题和选项缺失的情况
            let optionsHtml = '';
            if (q.type === 'judgment' || q.type === 'truefalse') {
                // 判断题特殊处理
                const options = ['正确', '错误'];
                optionsHtml = options.map((option, i) => {
                    const letter = String.fromCharCode(65 + i); // A, B
                    let labelClass = 'text-gray-700';
                    if (Array.isArray(correctAnswer) ? correctAnswer.includes(letter) : correctAnswer === letter) {
                       labelClass = 'text-green-600 font-bold';
                    }
                    if (userAnswer && (Array.isArray(userAnswer) ? userAnswer.includes(letter) : userAnswer === letter) && !isCorrect) {
                       labelClass = 'text-red-600 font-bold line-through';
                    }
                    return `<p class="${labelClass}">${letter}. ${option}</p>`;
                }).join('');
            } else if (q.options && Array.isArray(q.options) && q.options.length > 0) {
                // 有效选项的正常处理
                optionsHtml = q.options.map((option, i) => {
                    const letter = String.fromCharCode(65 + i);
                    let labelClass = 'text-gray-700';
                    if (Array.isArray(correctAnswer) ? correctAnswer.includes(letter) : correctAnswer === letter) {
                       labelClass = 'text-green-600 font-bold';
                    }
                    if (userAnswer && (Array.isArray(userAnswer) ? userAnswer.includes(letter) : userAnswer === letter) && !isCorrect) {
                       labelClass = 'text-red-600 font-bold line-through';
                    }
                    return `<p class="${labelClass}">${letter}. ${option}</p>`;
                }).join('');
            } else {
                // 选项数据缺失的错误处理
                optionsHtml = '<p class="text-red-500">选项数据缺失或格式错误</p>';
            }

            resultEl.innerHTML = `
                <p class="font-semibold mb-2">${index + 1}. ${q.question}</p>
                <div class="options-container space-y-2 mb-3">
                    ${optionsHtml}
                </div>
                <div class="text-sm p-2 rounded bg-gray-100">
                    <p>你的答案: <span class="font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}">${userAnswerText}</span></p>
                    <p>正确答案: <span class="font-bold text-green-700">${correctAnswerText}</span></p>
                    <p class="mt-2 text-gray-800"><b>解析:</b> ${q.explanation || '暂无解析'}</p>
                </div>
            `;
            resultQuestionsContainer.appendChild(resultEl);
        });
    }

    /**
     * 导出结果为 PDF
     */
    function exportToPdf() {
        if (!currentExam) {
            alert("没有可导出的考试结果。");
            return;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const content = document.getElementById('result-content');
        
        const originalTitle = resultTitle.textContent;
        resultTitle.textContent = currentExam.title; // 确保 PDF 标题正确

        html2canvas(content, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let heightLeft = pdfHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            
            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            
            pdf.save(`${currentExam.title.replace(/\s/g, '_')}_${new Date(currentExam.date).toLocaleDateString()}.pdf`);
            
            // 恢复原始标题（如果需要）
            resultTitle.textContent = originalTitle;
        });
    }

    /**
     * 删除单个考试记录
     * @param {number} index - 要删除的考试索引
     */
    function deleteExam(index) {
        if (confirm('确定要删除这条考试记录吗？')) {
            console.log(`删除考试记录 #${index}`);
            
            // 保存被删除考试的ID，用于后续比较
            const deletedExamId = examHistory[index].id;
            
            // 从历史记录中删除
            examHistory.splice(index, 1);
            localStorage.setItem('exam_history', JSON.stringify(examHistory));
            
            // 如果当前显示的是被删除的考试，则返回设置页面
            if (currentExam && currentExam.id === deletedExamId) {
                console.log('正在查看的考试被删除，返回设置页面');
                switchView('setup');
                currentExam = null;
            }
            
            // 更新历史记录列表显示
            renderHistoryList();
        }
    }

    // --- 事件监听器绑定 ---
    
    // API Key弹窗相关事件
    apiKeyBtn.addEventListener('click', showApiKeyModal);
    closeApiKeyModal.addEventListener('click', hideApiKeyModal);
    cancelApiKey.addEventListener('click', hideApiKeyModal);
    saveApiKey.addEventListener('click', saveApiKeyConfig);
    toggleApiKeyVisibilityBtn.addEventListener('click', toggleApiKeyVisibility);
    
    // 弹窗外部点击关闭
    apiKeyModal.addEventListener('click', (e) => {
        if (e.target === apiKeyModal) {
            hideApiKeyModal();
        }
    });
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !apiKeyModal.classList.contains('hidden')) {
            hideApiKeyModal();
        }
    });
    
    // 回车键保存API Key
    apiKeyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveApiKeyConfig();
        }
    });

    numQuestionsInput.addEventListener('input', (e) => {
        const value = e.target.value;
        numQuestionsLabel.textContent = value;
        
        // 更新滑块的填充效果
        const percentage = ((value - 10) / (60 - 10)) * 100;
        e.target.style.setProperty('--value', `${percentage}%`);
    });
    
    // 难度滑块事件监听
    examDifficultyInput.addEventListener('input', () => {
        updateDifficultyDisplay();
    });
    
    // 题库来源切换
    sourceModelRadio.addEventListener('change', handleSourceChange);
    sourceCustomRadio.addEventListener('change', handleSourceChange);
    sourcePasteRadio.addEventListener('change', handleSourceChange);
    
    // 文件选择
    selectFileBtn.addEventListener('click', () => {
        // 高亮支持格式
        const formatBadges = document.querySelectorAll('.format-badge');
        formatBadges.forEach(badge => {
            badge.classList.add('active');
            setTimeout(() => badge.classList.remove('active'), 1000);
        });
        
        customDatabaseFile.click();
    });
    customDatabaseFile.addEventListener('change', handleFileSelect);
    
    // 粘贴内容处理
    pasteContentArea.addEventListener('input', handlePasteContentChange);
    pasteContentArea.addEventListener('paste', () => {
        // 粘贴事件后稍微延迟处理，确保内容已粘贴
        setTimeout(handlePasteContentChange, 100);
    });
    
    // 预览功能事件
    editPreviewBtn.addEventListener('click', editPreview);
    reUploadBtn.addEventListener('click', reUpload);
    saveEditBtn.addEventListener('click', saveEdit);
    cancelEditBtn.addEventListener('click', cancelEdit);
    
    // 添加自定义知识点按钮的事件监听
    addCustomTopicBtn.addEventListener('click', addCustomTopic);
    customTopicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomTopic();
        }
    });
    
    // 侧边栏切换
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // 窗口大小变化事件
    window.addEventListener('resize', handleResize);
    
    // 日志展开/收起功能
    if (toggleLogBtn) {
        let isLogCollapsed = false;
        
        toggleLogBtn.addEventListener('click', () => {
            if (generationLog) {
                if (isLogCollapsed) {
                    generationLog.style.flex = '1';
                    generationLog.style.minHeight = '0';
                    generationLog.style.opacity = '1';
                    toggleLogBtn.textContent = '收起';
                    isLogCollapsed = false;
                } else {
                    generationLog.style.flex = '0 0 3rem';
                    generationLog.style.minHeight = '3rem';
                    generationLog.style.opacity = '0.8';
                    toggleLogBtn.textContent = '展开';
                    isLogCollapsed = true;
                }
            }
        });
    }

    // 确认开始答题按钮点击事件
    if (confirmStartExamBtn) {
        confirmStartExamBtn.addEventListener('click', () => {
            startExam();
        });
    }

    // 导航和操作按钮
    newExamBtn.addEventListener('click', () => {
        // 切换到设置视图
        switchView('setup');
        closeSidebar(); // 在移动端关闭侧边栏
        
        // 重置当前考试，移除高亮
        currentExam = null;
        renderHistoryList();
        
        // 重置考试设置
        // 清空自定义知识点
        customTopics = [];
        renderCustomTopics();
        
        // 重置知识点选择
        document.querySelectorAll('.child-topic, .parent-topic').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // 设置默认为大模型生成
        sourceModelRadio.checked = true;
        sourceCustomRadio.checked = false;
        sourcePasteRadio.checked = false;
        
        // 确保知识点选择区域显示
        const knowledgePointsSection = topicsTreeContainer.closest('.bg-white.rounded-xl.shadow-lg');
        if (knowledgePointsSection) {
            knowledgePointsSection.style.display = 'block';
        }
        
        handleSourceChange();
        
        // 重置文件选择
        customDatabaseContent = null;
        fileNameDisplay.innerHTML = '未选择文件';
        fileNameDisplay.classList.add('text-gray-500');
        fileNameDisplay.classList.remove('text-green-600', 'text-blue-600', 'text-red-600');
        customDatabaseFile.value = '';
        
        // 移除所有警告信息
        const container = customDatabaseContainer.querySelector('.bg-gray-50');  
        const existingElements = container?.querySelectorAll('.large-file-warning');
        if (existingElements) {
            existingElements.forEach(element => element.remove());
        }
        
        // 重置粘贴内容
        pasteContent = null;
        pasteContentArea.value = '';
        
        // 重置预览状态
        currentPreviewContent = null;
        originalPreviewContent = null;
        previewContainer.classList.add('hidden');
        
        // 重置题目数量
        numQuestionsInput.value = 15;
        numQuestionsLabel.textContent = '15';
        
        // 重置考试难度
        examDifficultyInput.value = 5;
        updateDifficultyDisplay();
    });
    
    generateExamBtn.addEventListener('click', () => {
        generateExam();
        closeSidebar(); // 在移动端关闭侧边栏
    });
    
    submitExamBtn.addEventListener('click', () => {
        submitExam();
        closeSidebar(); // 在移动端关闭侧边栏
    });
    
    clearHistoryBtn.addEventListener('click', clearHistory);
    recoverDataBtn.addEventListener('click', () => {
        const beforeApiKey = apiKey;
        const beforeHistoryCount = examHistory.length;
        
        debugDataStatus();
        
        const afterApiKey = apiKey;
        const afterHistoryCount = examHistory.length;
        
        let message = '数据检查完成';
        let type = 'success';
        
        if (!beforeApiKey && afterApiKey) {
            message = 'API Key 已恢复！';
            type = 'success';
        } else if (beforeHistoryCount === 0 && afterHistoryCount > 0) {
            message = `考试记录已恢复！找到 ${afterHistoryCount} 条记录`;
            type = 'success';
        } else if (!afterApiKey && afterHistoryCount === 0) {
            message = '未找到可恢复的数据，请重新设置';
            type = 'warning';
        }
        
        showTemporaryMessage(message, type);
        console.log('数据恢复完成，如需更多信息请查看控制台日志');
    });
    exportPdfBtn.addEventListener('click', exportToPdf);

    // --- 初始化 ---
    function initialize() {
        console.log('开始初始化应用...');
        
        // 设置默认API Key (如果已保存)
        if (apiKey) {
            console.log('从localStorage读取到API Key');
        } else {
            console.log('未找到保存的API Key');
        }
        
        // 渲染主题树和历史记录
        renderTopicsTree();
        console.log('主题树已渲染');
        
        // 清空自定义知识点并设置相关事件
        customTopics = [];
        renderCustomTopics();
        console.log('自定义知识点已初始化');
        
        // 设置回车键添加自定义知识点
        customTopicInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCustomTopic();
            }
        });
        
        // 初始化题库来源选择
        sourceModelRadio.checked = true;
        handleSourceChange();
        
        renderHistoryList();
        console.log('历史记录已渲染');
        
        // 添加树形结构变化的事件委托
        topicsTreeContainer.addEventListener('change', (e) => {
            console.log('主题选择已更改');
        });
        
        // 初始化数量滑块的显示
        numQuestionsLabel.textContent = numQuestionsInput.value;
        
        // 初始化滑块的填充效果
        const initialValue = numQuestionsInput.value;
        const initialPercentage = ((initialValue - 10) / (60 - 10)) * 100;
        numQuestionsInput.style.setProperty('--value', `${initialPercentage}%`);
        
        // 初始化难度滑块
        updateDifficultyDisplay();
        
        // 初始化步骤指示器
        updateStepIndicator();
        
        // 初始化移动端适配
        handleResize();
        
        // 初始化API Key状态显示
        updateApiKeyStatus();
        
        // 运行数据状态检查和恢复
        debugDataStatus();
        
        // 将调试函数暴露为全局函数，方便手动调用
        window.debugDataStatus = debugDataStatus;
        
        // 默认显示设置页面
        switchView('setup');
        console.log('初始化完成，显示设置页面');
        console.log('如果数据丢失，请在控制台输入 debugDataStatus() 尝试恢复');
    }

    initialize();
}); 