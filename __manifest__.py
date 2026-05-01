# -*- coding: utf-8 -*-
{
    'name': 'Shell Dashboard',
    'summary': 'Custom interactive dashboard module for Odoo backend',

    'description': """
Shell Dashboard adalah modul dashboard custom independen yang terinspirasi
dari modul Dynamic Dashboard karya Cybrosys Technologies.

Modul ini dikembangkan dengan pendekatan arsitektur dan sudut pandang yang berbeda,
menggunakan Chart.js, Bootstrap Icons, serta beberapa komponen UI kustom
yang dibangun dengan jQuery untuk kebutuhan visualisasi data di backend Odoo.
    """,

    'author': 'Fahmi Nur Fadillah (TechnoZee)',
    'website': 'https://techno-zee.my.id',

    'category': 'Dashboard',
    'version': '1.0',

    'depends': [
        'base',
        'web',
    ],

    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/shell_dashboard_menu.xml',
        'views/shell_dashboard.xml',
        'views/shell_setting.xml',
        'views/shell_block.xml',
        'views/shell_menu.xml'
    ],

    'assets': {
        'web.assets_backend': [

            # Linbaries
            'shell_dashboard/static/lib/chartjs/chart.umd.min.js',
            'shell_dashboard/static/src/data/fontawesome4-icons.json',
            
            # Components Template 
            'shell_dashboard/static/src/js/dashboard/dashboard_main.js',
            'shell_dashboard/static/src/js/dashboard/components/*.js',
            'shell_dashboard/static/src/js/**/*.js',
            'shell_dashboard/static/src/scss/**/*.scss',
            'shell_dashboard/static/src/xml/**/*.xml',
        ],
    },

    'installable': True,
    'application': True,
    'auto_install': False,
}
