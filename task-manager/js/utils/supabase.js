// Supabase 客户端管理
class SupabaseClient {
    constructor() {
        this.client = null;
        this.url = '';
        this.key = '';
        this.serviceKey = '';
    }

    // 获取 Supabase SDK
    getSDK() {
        // 等待 Supabase SDK 加载
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            throw new Error('Supabase SDK 尚未加载，请等待页面完全加载后再尝试连接');
        }
        return window.supabase;
    }

    // 初始化客户端
    init(url, key) {
        this.url = url;
        this.key = key;
        const sdk = this.getSDK();
        this.client = sdk.createClient(url, key);
        return this.client;
    }

    // 获取客户端
    getClient() {
        return this.client;
    }

    // 创建服务端客户端（使用 Service Role Key）
    createServiceClient(serviceKey) {
        this.serviceKey = serviceKey;
        const sdk = this.getSDK();
        return sdk.createClient(this.url, serviceKey);
    }

    // 测试连接
    async testConnection(tableName = 'daily_tasks') {
        if (!this.client) {
            throw new Error('客户端未初始化');
        }

        try {
            const { data, error } = await this.client
                .from(tableName)
                .select('count')
                .limit(1);

            const isTableNotFound = error && (
                error.code === 'PGRST116' ||
                error.message.includes("Could not find the table") ||
                (error.message.includes("relation") && error.message.includes("does not exist"))
            );

            return {
                success: !error || isTableNotFound,
                error: isTableNotFound ? null : error,
                tableExists: !isTableNotFound
            };
        } catch (error) {
            return {
                success: false,
                error: error,
                tableExists: false
            };
        }
    }
}

// 暴露到全局（使用不同的名字避免覆盖 Supabase SDK）
window.SupabaseClient = SupabaseClient;
window.supabaseClient = new SupabaseClient();

