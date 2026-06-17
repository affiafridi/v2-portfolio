<?php
/**
 * Meta Boxes — Headless Portfolio
 * Adds custom UI fields to Projects, Services, and Blog Posts.
 */

/* ══════════════════════════════════════════════════════════════════
   REGISTER META BOXES
══════════════════════════════════════════════════════════════════ */
add_action('add_meta_boxes', function () {

  /* ── Projects ─────────────────────────────────────────────────── */
  add_meta_box(
    'project_type_box',
    'Project Type',
    'headless_project_type_meta_box',
    'project',
    'side',
    'high'
  );

  add_meta_box(
    'project_details',
    'Work Details',
    'headless_project_details_cb',
    'project',
    'normal',
    'high'
  );

  add_meta_box(
    'project_features',
    'Features',
    'headless_project_features_cb',
    'project',
    'normal',
    'high'
  );

  add_meta_box(
    'project_gallery',
    'Gallery',
    'headless_project_gallery_cb',
    'project',
    'normal',
    'high'
  );

  /* ── Services ─────────────────────────────────────────────────── */
  add_meta_box(
    'service_details',
    'Service Details',
    'headless_service_details_cb',
    'service',
    'normal',
    'high'
  );

  add_meta_box(
    'service_points',
    'Points (What I Do)',
    'headless_service_points_cb',
    'service',
    'normal',
    'high'
  );

  add_meta_box(
    'service_deliverables',
    'Deliverables (What Client Gets)',
    'headless_service_deliverables_cb',
    'service',
    'normal',
    'high'
  );

  /* ── Blog Posts ───────────────────────────────────────────────── */
  add_meta_box(
    'post_details',
    'Post Details',
    'headless_post_details_cb',
    'post',
    'side',
    'high'
  );

});


/* ══════════════════════════════════════════════════════════════════
   SHARED STYLES + SCRIPTS (loaded once)
══════════════════════════════════════════════════════════════════ */
add_action('admin_head', function () {
  $screen = get_current_screen();
  if (!$screen || !in_array($screen->post_type, ['project', 'service', 'post'])) return;
  ?>
  <style>
    .hlmb-box { padding: 12px 0; }
    .hlmb-row { margin-bottom: 14px; }
    .hlmb-row label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #646970;
      margin-bottom: 5px;
    }
    .hlmb-row input[type="text"],
    .hlmb-row input[type="url"],
    .hlmb-row textarea {
      width: 100%;
      border-radius: 4px;
    }
    .hlmb-row textarea { min-height: 80px; resize: vertical; }

    /* Repeater */
    .hlmb-repeater-item {
      background: #f6f7f7;
      border: 1px solid #dcdcde;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 10px;
      position: relative;
    }
    .hlmb-repeater-item .hlmb-row { margin-bottom: 10px; }
    .hlmb-repeater-item .hlmb-row:last-child { margin-bottom: 0; }
    .hlmb-remove {
      position: absolute;
      top: 8px;
      right: 10px;
      background: none;
      border: none;
      color: #b32d2e;
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
      padding: 0;
    }
    .hlmb-remove:hover { color: #8a1f1f; }
    .hlmb-add {
      background: #f0f0f1;
      border: 1px solid #c3c4c7;
      border-radius: 4px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 4px;
    }
    .hlmb-add:hover { background: #e0e0e0; }

    /* Gallery */
    .hlmb-gallery-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 12px;
    }
    .hlmb-gallery-item {
      position: relative;
      width: 100px;
      height: 100px;
    }
    .hlmb-gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      display: block;
      border: 1px solid #dcdcde;
    }
    .hlmb-gallery-item .hlmb-remove {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #b32d2e;
      color: #fff;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>

  <script>
  jQuery(function($) {

    /* ── Generic string repeater ─────────────────────────────── */
    $(document).on('click', '.hlmb-add-string', function() {
      var wrap    = $(this).closest('.hlmb-repeater-wrap');
      var name    = wrap.data('name');
      var placeholder = wrap.data('placeholder') || '';
      var item = $('<div class="hlmb-repeater-item">' +
        '<button type="button" class="hlmb-remove" title="Remove">×</button>' +
        '<div class="hlmb-row">' +
          '<input type="text" name="' + name + '[]" value="" placeholder="' + placeholder + '" />' +
        '</div>' +
      '</div>');
      wrap.find('.hlmb-repeater-list').append(item);
    });

    /* ── Feature repeater (title + desc) ────────────────────── */
    $(document).on('click', '.hlmb-add-feature', function() {
      var list  = $(this).closest('.hlmb-repeater-wrap').find('.hlmb-repeater-list');
      var index = list.children().length;
      var item = $('<div class="hlmb-repeater-item">' +
        '<button type="button" class="hlmb-remove" title="Remove">×</button>' +
        '<div class="hlmb-row">' +
          '<label>Title</label>' +
          '<input type="text" name="features[' + index + '][title]" value="" placeholder="e.g. Shopify API" />' +
        '</div>' +
        '<div class="hlmb-row">' +
          '<label>Description</label>' +
          '<textarea name="features[' + index + '][desc]" placeholder="Short description of this feature..."></textarea>' +
        '</div>' +
      '</div>');
      list.append(item);
    });

    /* ── Remove any repeater item ────────────────────────────── */
    $(document).on('click', '.hlmb-remove', function() {
      $(this).closest('.hlmb-repeater-item').remove();
    });

    /* ── Gallery picker ──────────────────────────────────────── */
    var mediaFrame;
    $(document).on('click', '#hlmb-gallery-add', function(e) {
      e.preventDefault();
      if (mediaFrame) { mediaFrame.open(); return; }

      mediaFrame = wp.media({
        title:    'Select Gallery Images',
        button:   { text: 'Add to Gallery' },
        multiple: true,
        library:  { type: 'image' },
      });

      mediaFrame.on('select', function() {
        var attachments = mediaFrame.state().get('selection').toJSON();
        attachments.forEach(function(att) {
          var thumb = att.sizes && att.sizes.thumbnail ? att.sizes.thumbnail.url : att.url;
          var item = $('<div class="hlmb-gallery-item" data-id="' + att.id + '">' +
            '<img src="' + thumb + '" />' +
            '<button type="button" class="hlmb-remove" title="Remove">×</button>' +
            '<input type="hidden" name="gallery_ids[]" value="' + att.id + '" />' +
          '</div>');
          $('#hlmb-gallery-grid').append(item);
        });
      });

      mediaFrame.open();
    });

    /* ── Remove gallery item ─────────────────────────────────── */
    $(document).on('click', '.hlmb-gallery-item .hlmb-remove', function() {
      $(this).closest('.hlmb-gallery-item').remove();
    });

  });
  </script>
  <?php
});


/* ══════════════════════════════════════════════════════════════════
   CALLBACK: PROJECT TYPE — select dropdown
══════════════════════════════════════════════════════════════════ */
function headless_project_type_meta_box($post) {
  $taxonomy = 'project_type';
  $terms    = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false]);
  $current  = wp_get_object_terms($post->ID, $taxonomy, ['fields' => 'slugs']);
  $current  = (!is_wp_error($current) && !empty($current)) ? $current[0] : '';

  wp_nonce_field('headless_project_type_save', 'headless_project_type_nonce');
  ?>
  <div class="hlmb-box">
    <div class="hlmb-row">
      <label>Project Type</label>
      <select name="project_type_select" style="width:100%;padding:6px 8px;border-radius:4px;border:1px solid #dcdcde;">
        <option value="">— Select Type —</option>
        <?php if (!is_wp_error($terms)) foreach ($terms as $term) : ?>
          <option value="<?= esc_attr($term->slug) ?>" <?= selected($current, $term->slug, false) ?>>
            <?= esc_html($term->name) ?>
          </option>
        <?php endforeach; ?>
      </select>
      <p style="margin-top:8px;color:#646970;font-size:12px;">
        Manage types via <strong>Work → Project Types</strong> in the sidebar.
      </p>
    </div>
  </div>
  <?php
}

/* ══════════════════════════════════════════════════════════════════
   CALLBACK: PROJECT DETAILS
══════════════════════════════════════════════════════════════════ */
function headless_project_details_cb($post) {
  wp_nonce_field('headless_project_save', 'headless_project_nonce');
  $year      = get_post_meta($post->ID, 'year',      true);
  $client    = get_post_meta($post->ID, 'client',    true);
  $duration  = get_post_meta($post->ID, 'duration',  true);
  $live_url  = get_post_meta($post->ID, 'live_url',  true);
  $challenge = get_post_meta($post->ID, 'challenge', true);
  ?>
  <div class="hlmb-box">

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="hlmb-row">
        <label>Year</label>
        <input type="text" name="year" value="<?= esc_attr($year) ?>" placeholder="e.g. 2024" />
      </div>
      <div class="hlmb-row">
        <label>Duration</label>
        <input type="text" name="duration" value="<?= esc_attr($duration) ?>" placeholder="e.g. 6 weeks" />
      </div>
    </div>

    <div class="hlmb-row">
      <label>Client</label>
      <input type="text" name="client" value="<?= esc_attr($client) ?>" placeholder="e.g. Demo Project" />
    </div>

    <div class="hlmb-row">
      <label>Live URL</label>
      <input type="url" name="live_url" value="<?= esc_attr($live_url) ?>" placeholder="https://..." />
    </div>

    <div class="hlmb-row">
      <label>Challenge</label>
      <textarea name="challenge" placeholder="Describe the main challenge and how you solved it..."><?= esc_textarea($challenge) ?></textarea>
    </div>

  </div>
  <?php
}


/* ══════════════════════════════════════════════════════════════════
   CALLBACK: PROJECT FEATURES (repeater)
══════════════════════════════════════════════════════════════════ */
function headless_project_features_cb($post) {
  $features = json_decode(get_post_meta($post->ID, 'features', true), true) ?: [];
  ?>
  <div class="hlmb-box">
    <div class="hlmb-repeater-wrap" data-name="features">
      <div class="hlmb-repeater-list">
        <?php foreach ($features as $i => $feat) : ?>
        <div class="hlmb-repeater-item">
          <button type="button" class="hlmb-remove" title="Remove">×</button>
          <div class="hlmb-row">
            <label>Title</label>
            <input type="text" name="features[<?= $i ?>][title]" value="<?= esc_attr($feat['title'] ?? '') ?>" placeholder="e.g. Shopify API" />
          </div>
          <div class="hlmb-row">
            <label>Description</label>
            <textarea name="features[<?= $i ?>][desc]" placeholder="Short description..."><?= esc_textarea($feat['desc'] ?? '') ?></textarea>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
      <button type="button" class="hlmb-add hlmb-add-feature">+ Add Feature</button>
    </div>
  </div>
  <?php
}


/* ══════════════════════════════════════════════════════════════════
   CALLBACK: PROJECT GALLERY
══════════════════════════════════════════════════════════════════ */
function headless_project_gallery_cb($post) {
  $gallery_ids = json_decode(get_post_meta($post->ID, 'gallery', true), true) ?: [];
  ?>
  <div class="hlmb-box">
    <div id="hlmb-gallery-grid" class="hlmb-gallery-grid">
      <?php foreach ($gallery_ids as $id) :
        $thumb = wp_get_attachment_image_src($id, 'thumbnail');
        if (!$thumb) continue;
        ?>
        <div class="hlmb-gallery-item" data-id="<?= $id ?>">
          <img src="<?= esc_url($thumb[0]) ?>" />
          <button type="button" class="hlmb-remove" title="Remove">×</button>
          <input type="hidden" name="gallery_ids[]" value="<?= $id ?>" />
        </div>
      <?php endforeach; ?>
    </div>
    <button type="button" id="hlmb-gallery-add" class="hlmb-add">+ Add Images</button>
    <p style="margin-top:8px;color:#646970;font-size:12px;">Select one or multiple images from the Media Library.</p>
  </div>
  <?php
}


/* ══════════════════════════════════════════════════════════════════
   CALLBACK: SERVICE DETAILS
══════════════════════════════════════════════════════════════════ */
function headless_service_details_cb($post) {
  wp_nonce_field('headless_service_save', 'headless_service_nonce');
  $num = get_post_meta($post->ID, 'service_num', true);
  $tag = get_post_meta($post->ID, 'service_tag', true);
  ?>
  <div class="hlmb-box">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="hlmb-row">
        <label>Number</label>
        <input type="text" name="service_num" value="<?= esc_attr($num) ?>" placeholder="e.g. 01" />
      </div>
      <div class="hlmb-row">
        <label>Tag</label>
        <input type="text" name="service_tag" value="<?= esc_attr($tag) ?>" placeholder="e.g. Full Stack" />
      </div>
    </div>
  </div>
  <?php
}


/* ══════════════════════════════════════════════════════════════════
   CALLBACK: SERVICE POINTS (repeater)
══════════════════════════════════════════════════════════════════ */
function headless_service_points_cb($post) {
  $points = json_decode(get_post_meta($post->ID, 'points', true), true) ?: [];
  ?>
  <div class="hlmb-box">
    <div class="hlmb-repeater-wrap" data-name="points" data-placeholder="e.g. Next.js & React architecture">
      <div class="hlmb-repeater-list">
        <?php foreach ($points as $point) : ?>
        <div class="hlmb-repeater-item">
          <button type="button" class="hlmb-remove" title="Remove">×</button>
          <div class="hlmb-row">
            <input type="text" name="points[]" value="<?= esc_attr($point) ?>" placeholder="e.g. Next.js & React architecture" />
          </div>
        </div>
        <?php endforeach; ?>
      </div>
      <button type="button" class="hlmb-add hlmb-add-string">+ Add Point</button>
    </div>
  </div>
  <?php
}


/* ══════════════════════════════════════════════════════════════════
   CALLBACK: SERVICE DELIVERABLES (repeater)
══════════════════════════════════════════════════════════════════ */
function headless_service_deliverables_cb($post) {
  $deliverables = json_decode(get_post_meta($post->ID, 'deliverables', true), true) ?: [];
  ?>
  <div class="hlmb-box">
    <div class="hlmb-repeater-wrap" data-name="deliverables" data-placeholder="e.g. Source code & documentation">
      <div class="hlmb-repeater-list">
        <?php foreach ($deliverables as $item) : ?>
        <div class="hlmb-repeater-item">
          <button type="button" class="hlmb-remove" title="Remove">×</button>
          <div class="hlmb-row">
            <input type="text" name="deliverables[]" value="<?= esc_attr($item) ?>" placeholder="e.g. Source code & documentation" />
          </div>
        </div>
        <?php endforeach; ?>
      </div>
      <button type="button" class="hlmb-add hlmb-add-string">+ Add Deliverable</button>
    </div>
  </div>
  <?php
}


/* ══════════════════════════════════════════════════════════════════
   CALLBACK: POST DETAILS (blog)
══════════════════════════════════════════════════════════════════ */
function headless_post_details_cb($post) {
  wp_nonce_field('headless_post_save', 'headless_post_nonce');
  $num      = get_post_meta($post->ID, 'post_number',    true);
  $time     = get_post_meta($post->ID, 'read_time',      true);
  $category = get_post_meta($post->ID, 'category_label', true);
  ?>
  <div class="hlmb-box">
    <div class="hlmb-row">
      <label>Post Number</label>
      <input type="text" name="post_number" value="<?= esc_attr($num) ?>" placeholder="e.g. 001" />
    </div>
    <div class="hlmb-row">
      <label>Read Time</label>
      <input type="text" name="read_time" value="<?= esc_attr($time) ?>" placeholder="e.g. 6 min" />
    </div>
    <div class="hlmb-row">
      <label>Category</label>
      <input type="text" name="category_label" value="<?= esc_attr($category) ?>" placeholder="e.g. Design" />
    </div>
  </div>
  <?php
}


/* ══════════════════════════════════════════════════════════════════
   SAVE: PROJECT TYPE TAXONOMY
══════════════════════════════════════════════════════════════════ */
add_action('save_post_project', function ($post_id) {
  if (!isset($_POST['headless_project_type_nonce'])) return;
  if (!wp_verify_nonce($_POST['headless_project_type_nonce'], 'headless_project_type_save')) return;
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
  if (!current_user_can('edit_post', $post_id)) return;

  $slug = isset($_POST['project_type_select']) ? sanitize_text_field($_POST['project_type_select']) : '';
  wp_set_object_terms($post_id, $slug ? [$slug] : [], 'project_type');
});

/* ══════════════════════════════════════════════════════════════════
   SAVE: PROJECTS
══════════════════════════════════════════════════════════════════ */
add_action('save_post_project', function ($post_id) {
  if (!isset($_POST['headless_project_nonce'])) return;
  if (!wp_verify_nonce($_POST['headless_project_nonce'], 'headless_project_save')) return;
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
  if (!current_user_can('edit_post', $post_id)) return;

  // Simple string fields
  $string_fields = ['year', 'client', 'duration', 'challenge', 'live_url'];
  foreach ($string_fields as $field) {
    if (isset($_POST[$field])) {
      update_post_meta($post_id, $field, sanitize_text_field($_POST[$field]));
    }
  }

  // Features — array of {title, desc}
  if (isset($_POST['features']) && is_array($_POST['features'])) {
    $features = [];
    foreach ($_POST['features'] as $feat) {
      $title = sanitize_text_field($feat['title'] ?? '');
      $desc  = sanitize_textarea_field($feat['desc']  ?? '');
      if ($title || $desc) {
        $features[] = ['title' => $title, 'desc' => $desc];
      }
    }
    update_post_meta($post_id, 'features', wp_json_encode($features));
  } else {
    update_post_meta($post_id, 'features', wp_json_encode([]));
  }

  // Gallery — array of attachment IDs
  if (isset($_POST['gallery_ids']) && is_array($_POST['gallery_ids'])) {
    $ids = array_map('absint', $_POST['gallery_ids']);
    $ids = array_filter($ids);
    update_post_meta($post_id, 'gallery', wp_json_encode(array_values($ids)));
  } else {
    update_post_meta($post_id, 'gallery', wp_json_encode([]));
  }
});


/* ══════════════════════════════════════════════════════════════════
   SAVE: SERVICES
══════════════════════════════════════════════════════════════════ */
add_action('save_post_service', function ($post_id) {
  if (!isset($_POST['headless_service_nonce'])) return;
  if (!wp_verify_nonce($_POST['headless_service_nonce'], 'headless_service_save')) return;
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
  if (!current_user_can('edit_post', $post_id)) return;

  // Simple fields
  foreach (['service_num', 'service_tag'] as $field) {
    if (isset($_POST[$field])) {
      update_post_meta($post_id, $field, sanitize_text_field($_POST[$field]));
    }
  }

  // Points
  if (isset($_POST['points']) && is_array($_POST['points'])) {
    $points = array_filter(array_map('sanitize_text_field', $_POST['points']));
    update_post_meta($post_id, 'points', wp_json_encode(array_values($points)));
  } else {
    update_post_meta($post_id, 'points', wp_json_encode([]));
  }

  // Deliverables
  if (isset($_POST['deliverables']) && is_array($_POST['deliverables'])) {
    $deliverables = array_filter(array_map('sanitize_text_field', $_POST['deliverables']));
    update_post_meta($post_id, 'deliverables', wp_json_encode(array_values($deliverables)));
  } else {
    update_post_meta($post_id, 'deliverables', wp_json_encode([]));
  }
});


/* ══════════════════════════════════════════════════════════════════
   SAVE: BLOG POSTS
══════════════════════════════════════════════════════════════════ */
add_action('save_post_post', function ($post_id) {
  if (!isset($_POST['headless_post_nonce'])) return;
  if (!wp_verify_nonce($_POST['headless_post_nonce'], 'headless_post_save')) return;
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
  if (!current_user_can('edit_post', $post_id)) return;

  foreach (['post_number', 'read_time', 'category_label'] as $field) {
    if (isset($_POST[$field])) {
      update_post_meta($post_id, $field, sanitize_text_field($_POST[$field]));
    }
  }
});
