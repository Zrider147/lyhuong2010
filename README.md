## Query parameters

### &locale=en

Supported languages: `['en', 'it', 'tr', 'ar', 'fr']`

### &currency=EUR

Supported currency formats: `['EUR', 'USD', 'MAD', 'TRY']`

### &cheatRND=123

Giving a cheatRND random number as URL param and holding key "P" when clicking play button lets client send a cheat bet request. Math server returns cheat result based on the random number.

This param has higher priority than cheat panel.

### &cheat

If this parameter exists (its value can be arbitrary), enable cheat panel which can be opened by pressing key "P".

### &debug

If this parameter exists (its value can be arbitrary), the unhandled exception will be shown on the screen. So that the tester might get an idea of what is going on while facing an issue.
