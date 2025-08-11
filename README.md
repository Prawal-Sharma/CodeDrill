# Code Drill - Chrome Extension for LeetCode Practice

Practice coding interview problems without leaving your browser! Code Drill provides random LeetCode-style problems with a built-in code editor, test case execution, and progress tracking.

## Features

### Core Functionality
- **Random Problem Selection** - Get random coding problems filtered by difficulty (Easy/Medium/Hard) or tags
- **Built-in Code Editor** - Write and edit code with syntax highlighting for Python and JavaScript
- **Test Case Execution** - Run your code against test cases and see results instantly
- **Progress Tracking** - Track solved problems, success rate, and maintain coding streaks
- **Hints & Solutions** - Get progressive hints when stuck or view complete solutions with explanations

### Additional Features
- Daily coding challenges
- Light/Dark theme support
- Keyboard shortcuts for efficiency
- Time tracking per problem
- Local data persistence
- Offline mode with cached problems

## Installation

### For Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prawal-Sharma/CodeDrill.git
   cd CodeDrill
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `CodeDrill` directory

4. **Start developing**
   - The extension icon should appear in your Chrome toolbar
   - Click it to open the Code Drill popup

### For Users (Coming Soon)
The extension will be available on the Chrome Web Store once development is complete.

## Usage

1. **Getting Started**
   - Click the Code Drill icon in your Chrome toolbar
   - Click "Get Random Problem" to receive your first challenge

2. **Solving Problems**
   - Read the problem description and examples
   - Write your solution in the code editor
   - Choose your language (Python or JavaScript)
   - Click "Run Code" to test against sample cases
   - Click "Submit" to validate against all test cases

3. **Using Features**
   - **Filters**: Click the filter icon to select difficulty or problem tags
   - **Hints**: Click "Show Hint" for progressive hints (costs points)
   - **Solution**: Click "View Solution" to see the optimal solution
   - **Progress**: Check your stats in the progress section

## Development

### Project Structure
```
CodeDrill/
├── src/
│   ├── popup/          # Extension popup interface
│   ├── background/     # Service worker for background tasks
│   ├── editor/         # CodeMirror integration
│   ├── problems/       # Problem database
│   └── utils/          # API and storage utilities
├── assets/             # Icons and images
└── lib/               # Third-party libraries
```

### Technologies Used
- **Chrome Extension**: Manifest V3
- **Code Editor**: CodeMirror 6
- **Code Execution**: Judge0 API / Piston API
- **Styling**: Tailwind CSS
- **Storage**: Chrome Storage API & IndexedDB

### Building
```bash
npm run build    # Build for production
npm run dev      # Development build with watch
npm run test     # Run tests
npm run lint     # Lint code
```

## API Configuration

### Judge0 API (Default)
- Free tier includes 20,000 submissions
- No API key required for basic usage
- For higher limits, get an API key from [Judge0](https://judge0.com)

### Piston API (Fallback)
- Automatically used when Judge0 is unavailable
- Rate limited to 5 requests/second

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Test thoroughly before submitting PR

## Roadmap

### Version 1.0 (Current)
- ✅ Core problem-solving functionality
- ✅ Python and JavaScript support
- ✅ Basic progress tracking
- ✅ Hints and solutions

### Version 2.0 (Planned)
- [ ] More programming languages (Java, C++, Go)
- [ ] LeetCode account integration
- [ ] Export solutions to GitHub Gist
- [ ] Competition mode with friends
- [ ] Advanced analytics

### Version 3.0 (Future)
- [ ] AI-powered code review
- [ ] Custom problem creation
- [ ] Team challenges
- [ ] Interview simulation mode

## Privacy

Code Drill respects your privacy:
- All data is stored locally on your device
- No personal information is collected
- API calls are made directly to execution services
- See our [Privacy Policy](PRIVACY.md) for details

## Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/Prawal-Sharma/CodeDrill/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/Prawal-Sharma/CodeDrill/discussions)
- **Email**: support@codedrill.dev (coming soon)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to [Judge0](https://judge0.com) for the code execution API
- [CodeMirror](https://codemirror.net) for the excellent code editor
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- The open-source community for inspiration and support

---

**Built with ❤️ for developers preparing for technical interviews**