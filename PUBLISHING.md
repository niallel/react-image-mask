# Auto-Publishing Setup Guide

This guide explains how to set up automatic publishing to npm when you push to GitHub.

## 🔧 One-Time Setup

### 1. Create an NPM Access Token

1. **Login to npm**: Go to [npmjs.com](https://www.npmjs.com/) and log in
2. **Access Tokens**: Click on your profile → "Access Tokens"
3. **Generate New Token**: 
   - Click "Generate New Token"
   - Choose "Automation" (for CI/CD)
   - Copy the token (you won't see it again!)

### 2. Add NPM Token to GitHub Secrets

1. **Go to your GitHub repository**
2. **Settings tab** → **Secrets and variables** → **Actions**
3. **New repository secret**:
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

### 3. Choose Your Publishing Strategy

You have two workflows available:

#### Option A: Publish on Releases (Recommended)
- **File**: `.github/workflows/publish.yml`
- **Trigger**: When you create a GitHub release
- **Benefits**: More controlled, better for versioning

#### Option B: Publish on Push to Main
- **File**: `.github/workflows/publish-on-push.yml`
- **Trigger**: Every push to main branch
- **Benefits**: Fully automated, no manual releases

**Choose one**: Delete or comment out the workflow you don't want to use.

## 🚀 How to Publish

### Method 1: Using Releases (Recommended)

1. **Bump version and create tag**:
   ```bash
   # For patch version (0.1.1 → 0.1.2)
   npm run version:patch
   
   # For minor version (0.1.1 → 0.2.0)
   npm run version:minor
   
   # For major version (0.1.1 → 1.0.0)
   npm run version:major
   ```

2. **Push changes**:
   ```bash
   git push origin main
   git push origin --tags
   ```

3. **Create GitHub Release**:
   - Go to your GitHub repo → Releases → "Create a new release"
   - Choose the tag you just created
   - Add release notes
   - Click "Publish release"
   - 🎉 Auto-publishing will trigger!

### Method 2: Auto-publish on Push

1. **Update version in package.json**:
   ```json
   {
     "version": "0.1.2"
   }
   ```

2. **Push to main**:
   ```bash
   git add package.json
   git commit -m "Bump version to 0.1.2"
   git push origin main
   ```

3. **Auto-publishing triggers automatically!**

## 📋 Workflow Details

### What the Workflows Do:

1. **Checkout code** from GitHub
2. **Setup Node.js** environment
3. **Install dependencies** (`npm ci`)
4. **Run tests** to ensure quality
5. **Build the package** (`npm run build`)
6. **Publish to npm** (if version is new)

### Security Features:

- ✅ Uses GitHub's secure secrets for NPM token
- ✅ Runs tests before publishing
- ✅ Checks for version conflicts
- ✅ Uses modern GitHub Actions

## 🔍 Monitoring

### Check Publishing Status:

1. **GitHub Actions**: Go to your repo → Actions tab
2. **NPM Package**: Visit `https://www.npmjs.com/package/react-image-mask`
3. **Build Logs**: Check the workflow run for any errors

### Common Issues:

- **NPM_TOKEN expired**: Generate a new token and update GitHub secret
- **Version already exists**: Bump version in package.json
- **Tests failing**: Fix tests before publishing
- **Build errors**: Check your build configuration

## 🎯 Best Practices

1. **Always test locally first**:
   ```bash
   npm run build
   npm test
   npm pack  # Test the package
   ```

2. **Use semantic versioning**:
   - `patch`: Bug fixes (0.1.1 → 0.1.2)
   - `minor`: New features (0.1.1 → 0.2.0)
   - `major`: Breaking changes (0.1.1 → 1.0.0)

3. **Write good release notes**:
   - What's new
   - What's fixed
   - Breaking changes
   - Migration guide (if needed)

4. **Monitor your package**:
   - Check npm downloads
   - Review user feedback
   - Update dependencies regularly

## 🆘 Emergency: Stop Auto-Publishing

If you need to stop auto-publishing:

1. **Disable workflow**: Go to Actions → Select workflow → "..." → "Disable workflow"
2. **Delete NPM token**: Go to GitHub secrets and delete `NPM_TOKEN`
3. **Revoke npm token**: Go to npmjs.com and revoke the token

## 📝 Example Release Process

```bash
# 1. Make your changes
git add .
git commit -m "Add new feature X"

# 2. Bump version and create tag
npm run version:minor

# 3. Push everything
git push origin main
git push origin --tags

# 4. Create GitHub release (triggers auto-publish)
# Go to GitHub → Releases → Create new release

# 5. Check that it published
# https://www.npmjs.com/package/react-image-mask
```

That's it! Your package will now automatically publish to npm! 🎉 