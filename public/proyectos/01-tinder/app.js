document.addEventListener("DOMContentLoaded", function() {
    const DESICION_TRESHOLD = 280;

    const tabs = document.querySelectorAll('.interaction-container li');
    const cards = document.querySelectorAll('.swipeable .card');
    let isAnimating = false;
    let pullDeltaX = 0;

    function startDrag(e) {
        if (isAnimating) return;
        const actualCard = e.target.closest('.card');
        if (!actualCard) return;

        let startX = e.pageX || e.touches[0].pageX;

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: true });
        document.addEventListener('touchend', onEnd, { passive: true });

        function onMove(e) {
            let currentX = e.pageX || e.touches[0].pageX;
            pullDeltaX = currentX - startX;
            if (pullDeltaX === 0) return;
            isAnimating = true;
            const deg = pullDeltaX / 14;
            actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`;
            actualCard.style.cursor = 'grabbing';
            const opacity = Math.abs(pullDeltaX) / 100;
            const isRight = pullDeltaX > 0;
            const choiceEl = isRight ? actualCard.querySelector('.choice.like') : actualCard.querySelector('.choice.nope');
            choiceEl.style.opacity = opacity;
        }

        function onEnd() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            console.log(Math.abs(pullDeltaX))
            const decisionMade = Math.abs(pullDeltaX) >= DESICION_TRESHOLD;
            if (decisionMade) {
                const goRight = pullDeltaX >= 0;
                actualCard.classList.add(goRight ? 'go-right' : 'go-left');
                actualCard.addEventListener('transitionend', () => actualCard.remove());
            } else {
                actualCard.classList.add('reset');
                actualCard.classList.remove('go-right', 'go-left');
                actualCard.querySelectorAll('.choice').forEach(choice => choice.style.opacity = 0);
            }
            actualCard.addEventListener('transitionend', () => {
                actualCard.removeAttribute('style');
                actualCard.classList.remove('reset');
                pullDeltaX = 0;
                isAnimating = false;
            });
        }
    }

    cards.forEach(card => {
        if (card.classList.contains('end-nom-cards')) return;
        card.addEventListener('mousedown', startDrag);
        card.addEventListener('touchstart', startDrag, { passive: true });
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const allContents = document.querySelectorAll('.matches, .messages');
                allContents.forEach(content => content.classList.remove('active'));
                const activeContent = document.querySelector('.' + this.textContent.toLowerCase().trim());
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            }
        });
    });
});
