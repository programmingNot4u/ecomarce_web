
class MarketingSettings(models.Model):
    meta_pixel_id = models.CharField(max_length=50, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk and MarketingSettings.objects.exists():
            return MarketingSettings.objects.first().save()
        return super().save(*args, **kwargs)

    def __str__(self):
        return "Marketing Settings"
