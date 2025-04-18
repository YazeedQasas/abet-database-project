# Generated by Django 5.0.7 on 2025-03-19 17:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('programs', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Facility',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('facility_type', models.CharField(max_length=50)),
                ('capacity', models.IntegerField(blank=True, null=True)),
                ('equipment', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('document_type', models.CharField(max_length=50)),
                ('submission_date', models.DateField()),
                ('file', models.FileField(upload_to='documents/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('program', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='programs.program')),
            ],
        ),
        migrations.CreateModel(
            name='InstitutionalSupport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('budget_allocation', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ('leadership_description', models.TextField()),
                ('resources_description', models.TextField()),
                ('fiscal_year', models.CharField(max_length=9)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('program', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='institutional_support', to='programs.program')),
            ],
        ),
        migrations.CreateModel(
            name='MastersLevelRequirement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('individual_study_plan', models.BooleanField(default=False)),
                ('advanced_topics', models.TextField()),
                ('minimum_credits', models.IntegerField(default=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('program', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='masters_requirements', to='programs.program')),
            ],
        ),
        migrations.CreateModel(
            name='Meeting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('date', models.DateField()),
                ('report', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='meetings', to='programs.department')),
            ],
        ),
        migrations.CreateModel(
            name='ProgramCriteria',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('discipline', models.CharField(max_length=100)),
                ('lead_society', models.CharField(max_length=100)),
                ('curriculum_requirements', models.TextField()),
                ('faculty_requirements', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('program', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='program_criteria', to='programs.program')),
            ],
        ),
    ]
