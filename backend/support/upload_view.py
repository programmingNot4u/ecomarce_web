from rest_framework import views, parsers, response, status

class FileUploadView(views.APIView):
    parser_classes = [parsers.MultiPartParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return response.Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # In a real app, save to S3 or similar. Here, save to Media root.
        # We can use a simple model or storage API.
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        
        path = default_storage.save(f"uploads/{file_obj.name}", ContentFile(file_obj.read()))
        url = request.build_absolute_uri(default_storage.url(path))
        
        return response.Response({'url': url})
