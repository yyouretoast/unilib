const bookRatingContainer = document.getElementById('bookRating');
const serviceRatingContainer = document.getElementById('serviceRating');
const stars = document.querySelectorAll('.star');
const feedbackOutput = document.getElementById('feedback');

let bookStars = 0;
let serviceStars = 0;

function handleRating(container, ratingVar) {
    return function(evt) {
        const star = evt.target;
        const value = parseInt(star.dataset.value, 10);
        const currentContainer = container;

        const starsInContainer = currentContainer.querySelectorAll('.star');
        starsInContainer.forEach(s => s.classList.remove('active'));
        for (let i = 0; i < value; i++) {
            starsInContainer[i].classList.add('active');
        }

        if (container === bookRatingContainer) {
            bookStars = value;
        } else if (container === serviceRatingContainer) {
            serviceStars = value;
        }
    };
}

bookRatingContainer.addEventListener('click', handleRating(bookRatingContainer, bookStars));
serviceRatingContainer.addEventListener('click', handleRating(serviceRatingContainer, serviceStars));

function collectFeedback() {
    const bookTitle = document.getElementById('bookTitle').value;
    const comments = document.getElementById('comments').value;
    const feedbackText = `
    Book Title: ${bookTitle}
    Book Rating: ${bookStars} stars
    Service Rating: ${serviceStars} stars
    Comments: ${comments}
    `;

    feedback.textContent = feedbackText;
    feedback.style.display = 'block';
}