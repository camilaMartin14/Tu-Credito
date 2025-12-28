document.addEventListener('DOMContentLoaded', () => {
    console.log('Tu Credito - Front Loaded');
    
    const logo = document.querySelector('.coin-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            logo.style.transform = 'rotate(360deg)';
            logo.style.transition = 'transform 0.6s ease';
            
            setTimeout(() => {
                logo.style.transform = '';
                logo.style.transition = '';
            }, 600);
        });
    }

    const authors = ["Camila Martin", "Aylen García Maestri"];
    console.log(`Desarrollado con orgullo por ${authors.join(' y ')}`);
});
