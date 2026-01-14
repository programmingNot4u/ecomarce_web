from django.db import models

class ThemeConfig(models.Model):
    name = models.CharField(max_length=100, default='Default Theme')
    is_active = models.BooleanField(default=True)
    config = models.JSONField(default=dict) # Stores the huge JSON object
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.is_active:
             # Deactivate others
             ThemeConfig.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
