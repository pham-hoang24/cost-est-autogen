#!/bin/bash

echo "🔧 Installing All Dependencies for GDPR Anonymization Service"
echo "============================================================="

# Check Python version
echo "📋 Checking Python version..."
python3 --version

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip, setuptools, and wheel
echo "⬆️ Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

# Install requirements
echo "📦 Installing requirements from requirements.txt..."
pip install -r requirements.txt

# Install spacy language models
echo "🌍 Installing spacy language models..."
python -m spacy download en_core_web_sm
python -m spacy download en_core_web_lg

# Verify installation
echo "✅ Verifying installation..."
python -c "import fastapi, uvicorn, presidio_analyzer, presidio_anonymizer, spacy; print('All core packages imported successfully!')"

echo ""
echo "🎉 Installation completed successfully!"
echo "📋 Installed packages:"
pip list | grep -E "(fastapi|uvicorn|presidio|spacy|pandas|numpy|PyPDF2|python-docx|openpyxl|faker)"

echo ""
echo "🚀 You can now run the application with:"
echo "   python run.py"
