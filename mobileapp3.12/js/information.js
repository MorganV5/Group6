// 预览上传的图片
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const image = document.getElementById('profileImage');
            image.src = e.target.result;
            image.style.display = 'block';
            document.querySelector('.upload-text').style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
}
