#!/bin/bash
# Quick add promotional news - bash wrapper for easy access
# Usage: ./scripts/quick-add-promo.sh

echo "================================"
echo "🚀 Quick Promotional News Creator"
echo "================================"
echo ""
echo "Choose an option:"
echo "  1) Add content by pasting text"
echo "  2) Extract from webpage URL"
echo "  3) View active promotions"
echo ""
read -p "Choice [1]: " choice
choice=${choice:-1}

if [ "$choice" = "1" ]; then
    node scripts/create-promo-news.js
elif [ "$choice" = "2" ]; then
    read -p "Enter webpage URL: " url
    read -p "Enter type (e.g., 'vendor application'): " type
    node scripts/create-promo-from-url.js "$url" "$type"
elif [ "$choice" = "3" ]; then
    echo ""
    echo "📊 Active Promotional Items:"
    echo "----------------------------"
    echo "Run this SQL in Supabase:"
    echo ""
    echo "SELECT title, priority, start_date, end_date"
    echo "FROM promotional_news"
    echo "WHERE start_date <= NOW() AND end_date >= NOW()"
    echo "ORDER BY priority DESC LIMIT 3;"
    echo ""
else
    echo "❌ Invalid choice"
    exit 1
fi

