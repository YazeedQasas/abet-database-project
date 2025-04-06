from django.db import models

class ABETCriterion(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    
    def __str__(self):
        return self.name

class KPI(models.Model):
    criterion = models.ForeignKey(ABETCriterion, on_delete=models.CASCADE, related_name='kpis')
    name = models.CharField(max_length=255)
    description = models.TextField()
    weight = models.DecimalField(max_digits=5, decimal_places=2)  # Weight as percentage
    
    def __str__(self):
        return f"{self.criterion.name} - {self.name}"

class Assessment(models.Model):
    name = models.CharField(max_length=255)
    date_created = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
    
    def calculate_overall_score(self):
        scores = KPIScore.objects.filter(assessment=self)
        total_score = 0
        total_weight = 0
        
        for score in scores:
            total_score += score.score * float(score.kpi.weight)
            total_weight += float(score.kpi.weight)
        
        if total_weight > 0:
            return (total_score / total_weight)
        return 0

class KPIScore(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='scores')
    kpi = models.ForeignKey(KPI, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)  # Score from 0-100
    evidence = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ('assessment', 'kpi')
    
    def __str__(self):
        return f"{self.assessment.name} - {self.kpi.name}: {self.score}"
