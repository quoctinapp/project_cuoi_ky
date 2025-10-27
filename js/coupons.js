function copyCode(code, button) {
    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ Đã sao chép';
        button.classList.add('copied');

        showToast(`Đã sao chép mã: ${code}`, 'success');

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        showToast('Không thể sao chép mã', 'error');
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}