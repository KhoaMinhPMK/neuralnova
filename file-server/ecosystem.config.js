module.exports = {
    apps: [{
        name: 'neuralnova-fileserver',
        script: './server.js',

        // Windows specific
        instances: 1,
        exec_mode: 'fork',

        // Auto restart
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',

        // Logging
        error_file: './logs/error.log',
        out_file: './logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

        // Environment
        env: {
            NODE_ENV: 'production',
            PORT: 3001
        },

        // Restart delay
        restart_delay: 4000,

        // Error handling
        min_uptime: '10s',
        max_restarts: 10,

        // Process name
        instance_var: 'INSTANCE_ID',

        // Merge logs
        merge_logs: true,

        // Time
        time: true
    }]
}
