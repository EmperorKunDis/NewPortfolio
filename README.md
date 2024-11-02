# Interactive Portfolio Website

A modern, interactive portfolio website built with vanilla JavaScript and hosted on Vercel. Features a dynamic theme switcher, smooth transitions, and an engaging portfolio grid with expandable project cards.

## 🌟 Features

- **Dynamic Theme Switching**: Toggle between light and dark modes for comfortable viewing
- **Interactive Navigation**: Smooth section transitions with active state indicators
- **Portfolio Grid**: 
  - Expandable project cards with smooth animations
  - Seamless slideshow functionality for project images
  - Click-to-expand interaction with close functionality
  - Side decorator animations for visual appeal

## 🛠️ Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Vercel (Hosting)

## 🚀 Live Demo

[View Live Demo](https://martin-svanda-portfolio.vercel.app)

## 💻 Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/EmperorKunDis/NewPortfolio.git
```

2. Navigate to the project directory
```bash
cd NewPortfolio
```

3. Open `index.html` in your browser or use a local server
```bash
# Using npm live-server
npm install -g live-server
live-server
```

## 🎯 Core Functionality

### Theme Switching
```javascript
document.querySelector(".theme-btn").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
})
```

### Navigation Control
- Handles active state for both navigation buttons and content sections
- Implements smooth transitions between different portfolio sections

### Portfolio Grid Features
- **Expandable Items**: Click to expand project details
- **Automatic Slideshows**: Seamless image transitions
- **Responsive Layout**: Adapts to different screen sizes
- **Animation Management**: Handles entrance/exit animations and state management

## 🔧 Customization

### Adding New Portfolio Items

1. Add HTML markup following this structure:
```html
<div class="portfolio-item">
    <div class="project-overlay">
        <div class="slideshow-container">
            <!-- Add your project images here -->
        </div>
    </div>
    <div class="close-btn"></div>
</div>
```

2. Add corresponding styles in your CSS file
3. Images will automatically be included in the slideshow functionality

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## 📞 Contact

Martin Švanda - [@Martinvanda16](https://x.com/Martinvanda16)

Project Link: [https://github.com/EmperorKunDis/NewPortfolio](https://github.com/EmperorKunDis/NewPortfolio)
