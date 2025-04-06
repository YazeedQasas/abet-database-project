# Generated by Django 5.0.7 on 2025-03-28 22:41

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ABETCriterion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Assessment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('completed', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='KPI',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('weight', models.DecimalField(decimal_places=2, max_digits=5)),
                ('criterion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='kpis', to='assessment.abetcriterion')),
            ],
        ),
        migrations.CreateModel(
            name='KPIScore',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.DecimalField(decimal_places=2, max_digits=5)),
                ('evidence', models.TextField(blank=True, null=True)),
                ('assessment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='scores', to='assessment.assessment')),
                ('kpi', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='assessment.kpi')),
            ],
            options={
                'unique_together': {('assessment', 'kpi')},
            },
        ),
    ]
